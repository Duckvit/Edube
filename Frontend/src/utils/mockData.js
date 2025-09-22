export const statsData = {
  students: 1247,
  courses: 24,
  rating: 4.8,
  revenue: 12847,
};

export const activitiesData = [
  { course: "React Fundamentals", students: 45, status: "active" },
  { course: "Advanced JavaScript", students: 32, status: "active" },
  { course: "Node.js Backend", students: 28, status: "draft" },
  { course: "Database Design", students: 67, status: "active" },
];

export const coursesData = [
  {
    title: "React Fundamentals",
    students: 245,
    rating: 4.8,
    status: "Published",
    image:
      "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Advanced JavaScript",
    students: 189,
    rating: 4.7,
    status: "Published",
    image:
      "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Node.js Backend Development",
    students: 156,
    rating: 4.9,
    status: "Published"
  },
  {
    title: "Database Design Principles",
    students: 0,
    rating: 0,
    status: "Draft",
    image:
      "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export const studentsData = [
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    courses: 3,
    progress: 85,
    lastActive: "2 hours ago",
  },
  {
    name: "Mike Chen",
    email: "mike@example.com",
    courses: 2,
    progress: 92,
    lastActive: "1 day ago",
  },
  {
    name: "Emma Davis",
    email: "emma@example.com",
    courses: 4,
    progress: 67,
    lastActive: "3 hours ago",
  },
  {
    name: "Alex Wilson",
    email: "alex@example.com",
    courses: 1,
    progress: 45,
    lastActive: "5 days ago",
  },
  {
    name: "Lisa Brown",
    email: "lisa@example.com",
    courses: 2,
    progress: 78,
    lastActive: "1 hour ago",
  },
];

export const conversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    lastMessage: "Question about React hooks...",
    time: "2 min ago",
    messages: [
      { id: 1, sender: "Sarah Johnson", text: "Question about React hooks...", time: "2 min ago", isRead: false },
      { id: 2, sender: "Me", text: "Sure, what's your issue?", time: "15 min ago", isRead: true },
      { id: 3, sender: "Sarah Johnson", text: "Question about React hooks...", time: "1 hour ago", isRead: false },
      { id: 4, sender: "Me", text: "Sure, what's your issue?", time: "2 hours ago", isRead: true },
    ],
  },
  {
    id: 2,
    name: "Mike Chen",
    lastMessage: "Assignment submission help...",
    time: "15 min ago",
    messages: [
      { id: 1, sender: "Mike Chen", text: "Assignment submission help...", isRead: false },
    ],
  },
  {
    id: 3,
    name: "Emma Davis",
    lastMessage: "Course completion certificate...",
    time: "1 hour ago",
    messages: [
      { id: 1, sender: "Emma Davis", text: "Course completion certificate...", isRead: true },
    ],
  },
];