import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { fetchPosts, fetchAllPosts } from "../api/posts";
import { fetchAllUsers } from "../api/users";
import CardPost from "../components/CardPost";
import LoadingSpinner from "../components/LoadingSpinner";
import type { Post } from "../types/types";
import type { User } from "../types/types";

const ITEMS_PER_PAGE = 6;

const Home = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const prevSearchTermRef = useRef(searchTerm);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchAllUsers();
        const map = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<number, User>);
        setUsersMap(map);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let debounceTimer: NodeJS.Timeout;

    const getPosts = async () => {
      try {
        if (!searchTerm) {
          setLoading(true);
        }

        const postsResponse = searchTerm
          ? await fetchAllPosts()
          : await fetchPosts(currentPage, ITEMS_PER_PAGE, "");

        const processedPosts = postsResponse.posts.map((post) => {
          const user = usersMap[post.userId] || {
            firstName: "Unknown",
            lastName: "User",
            id: post.userId,
          };

          return {
            ...post,
            user,
          };
        });

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const filtered = processedPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(term) ||
              post.body.toLowerCase().includes(term) ||
              (post.tags &&
                post.tags.some((tag) => tag.toLowerCase().includes(term))) ||
              (post.user &&
                (post.user.firstName.toLowerCase().includes(term) ||
                  post.user.lastName.toLowerCase().includes(term)))
          );
          setFilteredPosts(filtered);
          setTotalPosts(filtered.length);
        } else {
          setAllPosts(processedPosts);
          setTotalPosts(postsResponse.total);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to fetch posts");
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const isSearch = prevSearchTermRef.current !== searchTerm;
    // eslint-disable-next-line prefer-const
    debounceTimer = setTimeout(getPosts, isSearch ? 500 : 300);

    prevSearchTermRef.current = searchTerm;

    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [currentPage, searchTerm, usersMap]);

  const currentPosts = searchTerm
    ? filteredPosts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : allPosts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );

  const totalPages = Math.ceil(
    (searchTerm ? filteredPosts.length : totalPosts) / ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-purple-50 to-white p-8 md:p-24">
      <header className="w-full flex flex-col justify-center items-center gap-8">
        <button className="bg-purple-100 text-purple-500 border-none rounded-xl px-2 text-sm">
          Makiti blog
        </button>
        <h1 className="text-3xl font-bold text-purple-900 text-center">
          Resources and insights
        </h1>
        <p className="text-purple-500 text-sm text-center">
          The latest industry news, interviews, technologies, and resources.
        </p>

        <form className="max-w-md mx-auto w-full" onSubmit={handleSearchSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search size="20" className="text-purple-500" />
            </div>
            <input
              type="search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border outline-none border-gray-300 rounded-lg bg-gray-50"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search posts"
            />
          </div>
        </form>
      </header>

      <main className="flex-1 py-16">
        {currentPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-purple-700">
              No posts found matching your search.
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-4 text-purple-600 hover:text-purple-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
              {currentPosts.map((post) => (
                <CardPost key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </main>

      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-8 gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
              aria-label="Previous page"
            >
              ← Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
          <div className="text-sm text-purple-600">
            Page {currentPage} of {Math.ceil(totalPages)} •{" "}
            {searchTerm ? filteredPosts.length : totalPosts} posts total
          </div>
        </div>
      )}

      <footer className="py-4 mt-8 text-center text-purple-600">
        <p>©2025 All rights reserved</p>
      </footer>
    </div>
  );
};

export default Home;
