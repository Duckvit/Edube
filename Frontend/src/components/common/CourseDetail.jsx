import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tabs,
  Button,
  Progress,
  List,
  Avatar,
  Input,
  Rate,
  Collapse,
  Typography,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  DownloadOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { getCourseById } from "../../apis/CourseServices";
import {
  getEnrollmentsByLearner,
  patchEnrollmentProgress,
  patchEnrollmentStatus,
} from "../../apis/EnrollmentServices";
import {
  createLessonProgress,
  getLessonProgressByEnrollment,
} from "../../apis/LessonProgressServices";
import { useUserStore } from "../../store/useUserStore";
import useAiStore from "../../store/useAiStore";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  // selected lesson by section and index
  const [currentLesson, setCurrentLesson] = useState(0);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [hasUserClickedLesson, setHasUserClickedLesson] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0); // Progress của video hiện tại
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [course, setCourse] = useState("");
  const [videoStartTime, setVideoStartTime] = useState(null); // Track start time for video
  const [lastProgressPercent, setLastProgressPercent] = useState(0); // Track last progress percentage sent to server
  const [lastProgressUpdateTime, setLastProgressUpdateTime] = useState(0); // Track last progress update timestamp
  const [lessonProgressMap, setLessonProgressMap] = useState(new Map()); // Map lessonId -> progress data
  const userData = useUserStore((s) => s.userData);
  const firstSection = course.curriculum?.[0];
  const firstLesson = firstSection?.lessons?.[currentLesson];
  const selectedLesson =
    course.curriculum?.[selectedSectionIndex]?.lessons?.[selectedLessonIndex];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getCourseById(courseId);
        const c = res?.data || res || {};

        const mapped = {
          id: c.id || c.courseId || c._id || courseId,
          title: c.title || c.name || "Untitled Course",
          instructor: c.instructor || c.mentor?.user?.fullName || "Unknown",
          description: c.description || c.summary || c.overview || "",
          rating: c.rating || 5,
          students: c.totalStudents ?? 0,
          duration:
            c.duration ||
            (c.durationHours
              ? `${c.durationHours} hours`
              : c.hours
              ? `${c.hours} hours`
              : "") ||
            0,
          totalLessons:
            c.totalLessons ||
            c.lessons ||
            (c.sections
              ? c.sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)
              : 0),
          curriculum: c.sections || c.curriculum || [],
          materials: c.materials || [],
          notes: c.notes || [],
          qna: c.qna || [],
        };

        // fetch enrollment for learner to get progress
        let progressPercentage = 0;
        try {
          const learnerId =
            userData?.id || useUserStore.getState().userData?.id || 1;
          const enrollments = await getEnrollmentsByLearner(learnerId);
          const enrollList = Array.isArray(enrollments)
            ? enrollments
            : enrollments?.data || enrollments?.content || [];
          const match = enrollList.find(
            (e) => String(e.course?.id) === String(mapped.id)
          );
          if (match) {
            progressPercentage = match.progressPercentage ?? 0;
            // store enrollment id for progress updates
            if (match.id) {
              setEnrollmentId(match.id);
              // Fetch lesson progress data
              const token = localStorage.getItem("token");
              if (token) {
                try {
                  const lessonProgressList = await getLessonProgressByEnrollment(
                    match.id,
                    token
                  );
                  // Create a map of lessonId -> progress
                  const progressMap = new Map();
                  if (Array.isArray(lessonProgressList)) {
                    lessonProgressList.forEach((progress) => {
                      const lessonId =
                        progress.lesson?.id ||
                        progress.lessonId ||
                        progress.lesson;
                      if (lessonId) {
                        progressMap.set(lessonId, progress);
                      }
                    });
                  }
                  if (mounted) setLessonProgressMap(progressMap);
                } catch (err) {
                  console.error("Failed to fetch lesson progress", err);
                }
              }
            }
            // normalize status to FE shape: map ACTIVE -> IN PROGRESS
            mapped.enrollmentStatus =
              match.status === "ACTIVE" ? "IN PROGRESS" : match.status || null;
          }
        } catch (e) {
          console.error("Failed to fetch enrollment for course detail", e);
        }

        // mark lessons as unlocked and compute completed based on lesson progress data
        const totalLessons =
          mapped.totalLessons ||
          (mapped.curriculum || []).reduce(
            (acc, s) => acc + (s.lessons?.length || 0),
            0
          );
        
        // Build curriculum with completed status
        // Note: lessonProgressMap will be set asynchronously, so we'll update it in a separate effect
        let assigned = 0;
        const curriculum = (mapped.curriculum || []).map((section) => {
          const lessons = (section.lessons || []).map((lesson) => {
            const lessonId =
              lesson.id || lesson.lessonId || lesson._id || lesson.lesson?.id;
            // Try to get from lessonProgressMap (might be empty on first load)
            const progress = lessonId ? lessonProgressMap.get(lessonId) : null;
            const completedFromProgress =
              progress?.isCompleted === true ||
              (progress?.completionPercentage ?? 0) >= 100;
            
            // Fallback to enrollment progress if lesson progress not available
            const completedCount = Math.round(
              ((progressPercentage || 0) / 100) * (totalLessons || 1)
            );
            const completed =
              completedFromProgress || assigned < completedCount;
            assigned += 1;
            
            return {
              ...lesson,
              locked: false,
              completed,
            };
          });
          return { ...section, lessons };
        });
        
        // Count actual completed lessons
        let completedCount = 0;
        curriculum.forEach((section) => {
          section.lessons.forEach((lesson) => {
            if (lesson.completed) completedCount++;
          });
        });
        
        // Update progress percentage based on actual completed lessons if we have lesson progress data
        if (lessonProgressMap.size > 0 && totalLessons > 0) {
          progressPercentage = Math.round((completedCount / totalLessons) * 100);
        }

        mapped.curriculum = curriculum;
        mapped.progress = Math.round(progressPercentage || 0);
        mapped.completedLessons = completedCount;

        // ensure selected indices are valid (reset to first available)
        if (mounted) {
          setSelectedSectionIndex(0);
          setSelectedLessonIndex(0);
          // ensure we don't send an update to server until the learner actually clicks a lesson
          setHasUserClickedLesson(false);
        }

        if (mounted) setCourse(mapped);
      } catch (err) {
        console.error("Failed to load course detail", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [courseId, userData]);

  const OverviewTab = () => (
    <div className="space-y-6">
      <Card title="About this course">
        <Paragraph className="text-gray-600 text-base leading-relaxed">
          {course.description}
        </Paragraph>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {course.totalLessons}
            </div>
            <div className="text-sm text-gray-600">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {course.duration}
            </div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {course.students?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          {/* <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {course.rating}/5
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </div> */}
        </div>
      </Card>

      <Card title="Instructor">
        <div className="flex items-center space-x-4">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            className="bg-gradient-to-r from-purple-600 to-blue-600 !mr-3"
          />
          <div>
            <h3 className="text-lg font-semibold">{course.instructor}</h3>
            <p className="text-gray-600">Senior Software Engineer & Educator</p>
            {/* <Rate disabled defaultValue={5} className="text-sm mt-1" /> */}
          </div>
        </div>
      </Card>
    </div>
  );

  const MaterialsTab = () => (
    <Card title="Course Materials">
      <List
        dataSource={course.materials}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                className="bg-blue-600"
              >
                Download
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <FileTextOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              }
              title={item.name}
              description={`${item.type} • ${item.size}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const NotesTab = () => (
    <div className="space-y-4">
      <Card title="My Notes">
        <TextArea
          rows={4}
          placeholder="Add a note about this lesson..."
          className="mb-4"
        />
        <Button type="primary" className="bg-blue-600">
          Save Note
        </Button>
      </Card>

      <Card title="Previous Notes">
        <List
          dataSource={course.notes}
          renderItem={(note) => (
            <List.Item>
              <List.Item.Meta
                title={<span className="text-blue-600">{note.lesson}</span>}
                description={
                  <div>
                    <p className="mb-2">{note.content}</p>
                    <span className="text-xs text-gray-500">
                      {note.timestamp}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const QATab = () => (
    <div className="space-y-4">
      <Card title="Ask a Question">
        <TextArea
          rows={3}
          placeholder="Ask your question here..."
          className="mb-4"
        />
        <Button type="primary" className="bg-blue-600">
          Post Question
        </Button>
      </Card>

      <Card title="Questions & Answers">
        <List
          dataSource={course.qna}
          renderItem={(item) => (
            <List.Item>
              <div className="w-full">
                <div className="mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {item.question}
                  </h4>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg mb-2">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Answered by {item.author}</span>
                  <div className="flex items-center space-x-4">
                    <span>{item.timestamp}</span>
                    <span>👍 {item.likes}</span>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: <OverviewTab />,
    },
    // {
    //   key: "materials",
    //   label: "Materials",
    //   children: <MaterialsTab />,
    // },
    // {
    //   key: "notes",
    //   label: "Notes",
    //   children: <NotesTab />,
    // },
    // {
    //   key: "qa",
    //   label: "Q&A",
    //   children: <QATab />,
    // },
  ];

  // Function to refresh lesson progress and update course curriculum
  const refreshLessonProgressData = useCallback(async () => {
    if (!enrollmentId) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const lessonProgressList = await getLessonProgressByEnrollment(
        enrollmentId,
        token
      );
      // Create a map of lessonId -> progress
      const progressMap = new Map();
      if (Array.isArray(lessonProgressList)) {
        lessonProgressList.forEach((progress) => {
          const lessonId =
            progress.lesson?.id ||
            progress.lessonId ||
            progress.lesson;
          if (lessonId) {
            progressMap.set(lessonId, progress);
          }
        });
      }
      setLessonProgressMap(progressMap);
      
      // Update course curriculum with actual lesson progress
      setCourse((prevCourse) => {
        if (!prevCourse || !prevCourse.curriculum) return prevCourse;
        
        const updated = { ...prevCourse };
        const curriculum = (updated.curriculum || []).map((section) => {
          const lessons = (section.lessons || []).map((lesson) => {
            const lessonId =
              lesson.id || lesson.lessonId || lesson._id || lesson.lesson?.id;
            const progress = lessonId ? progressMap.get(lessonId) : null;
            const completed =
              progress?.isCompleted === true ||
              (progress?.completionPercentage ?? 0) >= 100;
            
            return {
              ...lesson,
              completed,
              locked: false,
            };
          });
          return { ...section, lessons };
        });
        
        // Count actual completed lessons
        let completedCount = 0;
        curriculum.forEach((section) => {
          section.lessons.forEach((lesson) => {
            if (lesson.completed) completedCount++;
          });
        });
        
        updated.curriculum = curriculum;
        updated.completedLessons = completedCount;
        
        const totalLessons =
          updated.totalLessons ||
          curriculum.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
        if (totalLessons > 0) {
          updated.progress = Math.round((completedCount / totalLessons) * 100);
        }
        
        return updated;
      });
    } catch (err) {
      console.error("Failed to refresh lesson progress", err);
    }
  }, [enrollmentId]);

  // Helper function to create/update lesson progress
  const updateLessonProgress = useCallback(
    async (
      lesson,
      completionPercentage,
      timeSpentMinutes = 0,
      isCompleted = false
    ) => {
      if (!enrollmentId || !lesson) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      // Get lesson ID - could be id, lessonId, or _id
      const lessonId =
        lesson.id || lesson.lessonId || lesson._id || lesson.lesson?.id;
      if (!lessonId) {
        console.warn("Lesson ID not found", lesson);
        return;
      }

      try {
        const progressData = {
          enrollment: {
            id: enrollmentId,
          },
          lesson: {
            id: lessonId,
          },
          isCompleted: isCompleted,
          timeSpentMinutes: timeSpentMinutes,
          completionPercentage: parseFloat(completionPercentage.toFixed(2)),
        };

        const result = await createLessonProgress(token, progressData);
        // Refresh lesson progress data after update (with small delay to ensure DB update)
        if (result) {
          setTimeout(() => {
            refreshLessonProgressData();
          }, 500);
        }
      } catch (err) {
        console.error("Failed to update lesson progress:", err);
      }
    },
    [enrollmentId, refreshLessonProgressData]
  );

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      setVideoProgress(percent);

      // Track time spent (convert seconds to minutes)
      const currentTime = video.currentTime;
      const timeSpentMinutes = Math.floor(currentTime / 60);

      // Update lesson progress periodically (every 10% or every 30 seconds)
      const now = Date.now();
      const shouldUpdate =
        percent - lastProgressPercent >= 10 ||
        now - lastProgressUpdateTime >= 30000;

      if (shouldUpdate) {
        updateLessonProgress(
          selectedLesson,
          percent,
          timeSpentMinutes,
          percent >= 100
        );
        setLastProgressPercent(percent);
        setLastProgressUpdateTime(now);
      }

      // Mark as completed when video reaches 100%
      if (percent >= 100 && !selectedLesson?.completed) {
        updateLessonProgress(selectedLesson, 100, timeSpentMinutes, true);
      }
    }
  };

  // Reset video progress when lesson changes
  useEffect(() => {
    setVideoProgress(0);
    setVideoStartTime(Date.now());
    setLastProgressPercent(0);
    setLastProgressUpdateTime(0);
  }, [selectedSectionIndex, selectedLessonIndex]);

  // Track video start time when lesson is selected
  useEffect(() => {
    if (selectedLesson && getContentType(selectedLesson) === "video") {
      setVideoStartTime(Date.now());
      // Initialize lesson progress when video starts
      const token = localStorage.getItem("token");
      if (token && enrollmentId) {
        updateLessonProgress(selectedLesson, 0, 0, false);
      }
    }
  }, [selectedLesson, enrollmentId, updateLessonProgress]);

  // Refresh lesson progress when enrollmentId is set
  useEffect(() => {
    if (enrollmentId) {
      refreshLessonProgressData();
    }
  }, [enrollmentId, refreshLessonProgressData]);

  // Handle mark as read for documents
  const handleMarkAsRead = async () => {
    if (!enrollmentId || !selectedLesson) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Create/update lesson progress for document
      await updateLessonProgress(selectedLesson, 100, 0, true);

      const curriculum = course.curriculum || [];
      const totalLessons =
        course.totalLessons ||
        curriculum.reduce((a, s) => a + (s.lessons?.length || 0), 0) ||
        1;
      const linearIdx = getLinearIndex(
        curriculum,
        selectedSectionIndex,
        selectedLessonIndex
      );
      const completedLessons = Math.min(totalLessons, linearIdx + 1);
      const percent = Math.round((completedLessons / totalLessons) * 100);

      // if computed completedLessons is not greater than existing completedLessons, skip update
      const existingCompleted = course.completedLessons || 0;
      if (completedLessons <= existingCompleted) {
        // Still update UI to mark as completed even if already completed
        const updated = { ...course };
        let assigned2 = 0;
        updated.curriculum = (updated.curriculum || []).map((section) => {
          const lessons = (section.lessons || []).map((lesson) => {
            const completed = assigned2 < completedLessons;
            assigned2 += 1;
            return { ...lesson, completed, locked: false };
          });
          return { ...section, lessons };
        });
        setCourse(updated);
        return;
      }

      // call patch API
      await patchEnrollmentProgress(enrollmentId, percent, token);

      // After server update, re-fetch enrollment(s) to get authoritative progress
      const learnerId = userData?.id || useUserStore.getState().userData?.id;
      if (learnerId) {
        try {
          const enrollments = await getEnrollmentsByLearner(learnerId, token);
          const enrollList = Array.isArray(enrollments)
            ? enrollments
            : enrollments?.data || enrollments?.content || [];
          const match = enrollList.find(
            (e) => String(e.course?.id) === String(course.id)
          );
          if (match) {
            const progressPercentage = match.progressPercentage ?? 0;
            const total =
              course.totalLessons ||
              (course.curriculum || []).reduce(
                (acc, s) => acc + (s.lessons?.length || 0),
                0
              );
            const completedFromServer = Math.round(
              ((progressPercentage || 0) / 100) * (total || 1)
            );

            const updated = { ...course };
            updated.progress = Math.round(progressPercentage || 0);
            updated.completedLessons = completedFromServer;
            let assigned2 = 0;
            updated.curriculum = (updated.curriculum || []).map((section) => {
              const lessons = (section.lessons || []).map((lesson) => {
                const completed = assigned2 < completedFromServer;
                assigned2 += 1;
                return { ...lesson, completed, locked: false };
              });
              return { ...section, lessons };
            });
            updated.enrollmentStatus =
              match.status === "ACTIVE" ? "IN PROGRESS" : match.status || null;
            setCourse(updated);

            // if the learner just reached 100% and server status not completed, update status
            if (
              Math.round(progressPercentage || 0) === 100 &&
              String(match.status || "").toUpperCase() !== "COMPLETED"
            ) {
              try {
                await patchEnrollmentStatus(
                  match.id || enrollmentId,
                  "completed",
                  token
                );
              } catch (err) {
                console.error(
                  "Failed to update enrollment status to completed:",
                  err
                );
              }
            }
          }
        } catch (e) {
          console.error("Failed to refresh enrollment after patch", e);
        }
      }
    } catch (err) {
      console.error("Failed to mark lesson as read:", err);
    }
  };

  // Helper function to detect content type
  const getContentType = (lesson) => {
    if (!lesson || !lesson.contentUrl) return null;
    const url = lesson.contentUrl;
    const lower = String(url).toLowerCase();
    if (/\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/.test(lower)) return "video";
    if (/\.pdf(\?.*)?$/.test(lower)) return "pdf";
    if (/\.(docx?|pptx?|xlsx?)(\?.*)?$/.test(lower)) return "doc";
    return "other";
  };

  // Render lesson content based on its contentUrl or contentText
  const renderLessonContent = (lesson) => {
    if (!lesson) {
      return (
        <div className="flex flex-col items-center justify-center text-white">
          <PlayCircleOutlined style={{ fontSize: 64 }} />
          <p className="mt-4 text-lg font-semibold">No lesson selected</p>
        </div>
      );
    }

    const url = lesson.contentUrl;
    if (url) {
      const lower = String(url).toLowerCase();
      const isVideo = /\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/.test(lower);
      const isPdf = /\.pdf(\?.*)?$/.test(lower);
      const isDoc = /\.(docx?|pptx?|xlsx?)(\?.*)?$/.test(lower);

      if (isVideo) {
        return (
          <video
            src={url}
            controls
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain rounded-lg bg-black"
          />
        );
      }

      if (isPdf) {
        return (
          <iframe src={url} title={lesson.title} className="w-full h-full" />
        );
      }

      if (isDoc) {
        const viewer = `https://docs.google.com/gview?url=${encodeURIComponent(
          url
        )}&embedded=true`;
        return (
          <iframe src={viewer} title={lesson.title} className="w-full h-full" />
        );
      }

      // fallback: try iframe
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <iframe src={url} title={lesson.title} className="w-full h-full" />
        </div>
      );
    }

    if (lesson.contentText) {
      return (
        <div className="prose max-w-none p-4 overflow-auto text-white">
          <div className="bg-white text-black p-4 rounded">
            {lesson.contentText}
          </div>
        </div>
      );
    }

    return (
      <div className="text-white text-center p-4">
        No preview available for this lesson.
      </div>
    );
  };

  // helper: compute linear lesson index (0-based) from section/lesson indices
  const getLinearIndex = (curriculum, sectionIdx, lessonIdx) => {
    if (!curriculum) return 0;
    let idx = 0;
    for (let s = 0; s < curriculum.length; s++) {
      const lessons = curriculum[s].lessons || [];
      if (s < sectionIdx) {
        idx += lessons.length;
      } else if (s === sectionIdx) {
        idx += Math.max(0, lessonIdx);
        break;
      } else break;
    }
    return idx;
  };

  // update progress on server when selected lesson changes (skip initial mount)
  useEffect(() => {
    let mounted = true;
    const doUpdate = async () => {
      try {
        // Only update when we have an enrollment and the user actually clicked a lesson
        if (!enrollmentId || !hasUserClickedLesson) return;

        const curriculum = course.curriculum || [];
        const totalLessons =
          course.totalLessons ||
          curriculum.reduce((a, s) => a + (s.lessons?.length || 0), 0) ||
          1;
        const linearIdx = getLinearIndex(
          curriculum,
          selectedSectionIndex,
          selectedLessonIndex
        );
        const completedLessons = Math.min(totalLessons, linearIdx + 1);
        const percent = Math.round((completedLessons / totalLessons) * 100);

        // if computed completedLessons is not greater than existing completedLessons, skip update
        const existingCompleted = course.completedLessons || 0;
        if (completedLessons <= existingCompleted) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        // call patch API
        await patchEnrollmentProgress(enrollmentId, percent, token);

        // After server update, re-fetch enrollment(s) to get authoritative progress and reflect it
        const learnerId = userData?.id || useUserStore.getState().userData?.id;
        if (learnerId) {
          try {
            const enrollments = await getEnrollmentsByLearner(learnerId, token);
            const enrollList = Array.isArray(enrollments)
              ? enrollments
              : enrollments?.data || enrollments?.content || [];
            const match = enrollList.find(
              (e) => String(e.course?.id) === String(course.id)
            );
            if (match) {
              const progressPercentage = match.progressPercentage ?? 0;
              const total =
                course.totalLessons ||
                (course.curriculum || []).reduce(
                  (acc, s) => acc + (s.lessons?.length || 0),
                  0
                );
              const completedFromServer = Math.round(
                ((progressPercentage || 0) / 100) * (total || 1)
              );

              if (mounted) {
                const updated = { ...course };
                updated.progress = Math.round(progressPercentage || 0);
                updated.completedLessons = completedFromServer;
                let assigned2 = 0;
                updated.curriculum = (updated.curriculum || []).map(
                  (section) => {
                    const lessons = (section.lessons || []).map((lesson) => {
                      const completed = assigned2 < completedFromServer;
                      assigned2 += 1;
                      return { ...lesson, completed, locked: false };
                    });
                    return { ...section, lessons };
                  }
                );
                // map status shape from server: ACTIVE -> IN PROGRESS
                updated.enrollmentStatus =
                  match.status === "ACTIVE"
                    ? "IN PROGRESS"
                    : match.status || null;
                setCourse(updated);
                // update enrollmentId if newly available
                if (match.id) setEnrollmentId(match.id);
                // if the learner just reached 100% and server status not completed, update status
                if (
                  Math.round(progressPercentage || 0) === 100 &&
                  String(match.status || "").toUpperCase() !== "COMPLETED"
                ) {
                  try {
                    await patchEnrollmentStatus(
                      match.id || enrollmentId,
                      "completed",
                      token
                    );
                  } catch (err) {
                    console.error(
                      "Failed to update enrollment status to completed:",
                      err
                    );
                  }
                }
              }
            }
          } catch (e) {
            console.error("Failed to refresh enrollment after patch", e);
          }
        }
      } catch (err) {
        console.error("Failed to patch enrollment progress:", err);
      }
    };

    // only update when course exists, enrollmentId is set and user clicked a lesson
    if (course && enrollmentId !== null && hasUserClickedLesson) {
      doUpdate();
    }

    return () => {
      mounted = false;
    };
  }, [
    selectedSectionIndex,
    selectedLessonIndex,
    enrollmentId,
    hasUserClickedLesson,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
              >
                <ArrowLeftOutlined />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4">by {course.instructor}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {/* <div className="flex items-center">
                  <Rate
                    disabled
                    defaultValue={course.rating}
                    allowHalf
                    className="text-xs mr-2"
                  />
                  <span>{course.rating}</span>
                </div> */}
                <span>{course.students?.toLocaleString()} students</span>
                <span>{course.duration}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right mb-2">
                <span className="text-sm text-gray-600">
                  {course.completedLessons} of {course.totalLessons} lessons
                  completed
                </span>
              </div>
              <Progress percent={course.progress} className="w-64" />
              <div className="mt-3 text-right">
                <Button
                  size="middle"
                  type="default"
                  onClick={() =>
                    useAiStore
                      .getState()
                      .summarizeCourseAndShow(course.id, course.title)
                  }
                  className="!bg-blue-50 !border !border-blue-200 !text-blue-700 hover:!bg-blue-100 hover:!border-blue-300 !rounded-md !text-sm !font-medium"
                >
                  📚 Summarize This Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="aspect-video rounded-lg bg-black mb-4 flex items-center justify-center">
                {renderLessonContent(selectedLesson)}
              </div>
              {/* Progress bar for video */}
              {selectedLesson && getContentType(selectedLesson) === "video" && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Video Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(videoProgress)}%
                    </span>
                  </div>
                  <Progress percent={Math.round(videoProgress)} />
                </div>
              )}
              {/* Mark as Read button for documents */}
              {selectedLesson &&
                (getContentType(selectedLesson) === "pdf" ||
                  getContentType(selectedLesson) === "doc") && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleMarkAsRead}
                      className="bg-blue-600"
                      disabled={selectedLesson?.completed}
                    >
                      {selectedLesson?.completed
                        ? "Already Read"
                        : "Mark as Read"}
                    </Button>
                  </div>
                )}
            </Card>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
            />
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card title="Course Curriculum" className="sticky top-4">
              <Collapse
                accordion
                items={(course.curriculum || []).map(
                  (section, sectionIndex) => ({
                    key: sectionIndex,
                    label: (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{` 
                        ${section.description || section.section || ""}
                        `}</span>
                        <span className="text-sm text-gray-500">
                          {
                            (section.lessons || []).filter((l) => l.completed)
                              .length
                          }
                          /{(section.lessons || []).length}
                        </span>
                      </div>
                    ),
                    children: (
                      <div>
                        {section.description && (
                          <div className="mb-3 text-sm text-gray-600">
                            {section.description}
                          </div>
                        )}
                        <List
                          dataSource={section.lessons || []}
                          renderItem={(lesson, index) => {
                            const isSelected =
                              selectedSectionIndex === sectionIndex &&
                              selectedLessonIndex === index;
                            return (
                              <List.Item
                                className={`cursor-pointer hover:bg-gray-50 px-2 py-3 rounded transition-all duration-200 ${
                                  lesson.locked ? "opacity-50" : ""
                                } ${
                                  isSelected
                                    ? "bg-blue-50 border-l-4 border-blue-600 shadow-sm"
                                    : ""
                                }`}
                                onClick={() => {
                                  if (!lesson.locked) {
                                    // mark that the user actively clicked a lesson so we trigger a server update
                                    setHasUserClickedLesson(true);
                                    setSelectedSectionIndex(sectionIndex);
                                    setSelectedLessonIndex(index);
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center space-x-3">
                                    {lesson.locked ? (
                                      <LockOutlined className="text-gray-400" />
                                    ) : lesson.completed ? (
                                      <CheckCircleOutlined className="text-green-500" />
                                    ) : (
                                      <PlayCircleOutlined className="text-blue-500" />
                                    )}
                                    <div>
                                      <div className="font-medium text-sm">
                                        {lesson.title}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {lesson.duration}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </List.Item>
                            );
                          }}
                        />
                      </div>
                    ),
                  })
                )}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
