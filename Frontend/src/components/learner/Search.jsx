import React, { memo } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

export const SearchBar = memo(({ searchText, setSearchText }) => (
  <Search
    placeholder="Search courses by title or instructor"
    allowClear
    enterButton={<SearchOutlined />}
    size="large"
    className="flex-1"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />
));

export default SearchBar;
