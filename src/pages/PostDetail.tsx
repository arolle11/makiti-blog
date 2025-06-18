import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostById } from "../api/posts";
import { fetchUserById } from "../api/users";
import type { Post } from "../api/posts";
import type { User } from "../api/users";
import image from "../assets/image.png";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<(Post & { user?: User }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      try {
        setLoading(true);
        const postData = await fetchPostById(Number(id));

        // Fetch user data
        let userData: User | undefined;
        try {
          userData = await fetchUserById(postData.userId);
        } catch (userError) {
          console.warn("Failed to fetch user:", userError);
          userData = {
            id: postData.userId,
            firstName: "Unknown",
            lastName: "User",
          };
        }

        // Check local storage for likes/dislikes
        const likedPosts = JSON.parse(
          localStorage.getItem("likedPosts") || "{}"
        );
        const dislikedPosts = JSON.parse(
          localStorage.getItem("dislikedPosts") || "{}"
        );

        setPost({
          ...postData,
          user: userData,
        });
        setIsLiked(!!likedPosts[postData.id]);
        setIsDisliked(!!dislikedPosts[postData.id]);
      } catch (err) {
        setError("Failed to fetch post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getPost();
  }, [id]);

  const handleLike = () => {
    if (!post) return;

    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    const dislikedPosts = JSON.parse(
      localStorage.getItem("dislikedPosts") || "{}"
    );

    if (isDisliked) {
      delete dislikedPosts[post.id];
      setIsDisliked(false);
      localStorage.setItem("dislikedPosts", JSON.stringify(dislikedPosts));
    }

    const newIsLiked = !isLiked;

    if (newIsLiked) {
      likedPosts[post.id] = true;
    } else {
      delete likedPosts[post.id];
    }

    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    setIsLiked(newIsLiked);
  };

  const handleDislike = () => {
    if (!post) return;

    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    const dislikedPosts = JSON.parse(
      localStorage.getItem("dislikedPosts") || "{}"
    );

    if (isLiked) {
      delete likedPosts[post.id];
      setIsLiked(false);
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    }

    const newIsDisliked = !isDisliked;

    if (newIsDisliked) {
      dislikedPosts[post.id] = true;
    } else {
      delete dislikedPosts[post.id];
    }

    localStorage.setItem("dislikedPosts", JSON.stringify(dislikedPosts));
    setIsDisliked(newIsDisliked);
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

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/" className="text-purple-600 hover:text-purple-800">
          ← Back to all posts
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md p-6">
        <img
          src={image}
          alt="post"
          className="w-full h-64 object-cover mb-6 rounded"
        />

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-lg md:text-3xl font-bold text-purple-900">
            {post.title}
          </h1>
          {post.user && (
            <p className="text-xs md:text-sm text-gray-600">
              By {post.user.firstName} {post.user.lastName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="prose max-w-none text-gray-700 mb-6 text-base">
          <p className="whitespace-pre-line">{post.body}</p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
          <div>
            <span>Views: {post.views}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${
                isLiked ? "text-purple-700" : "text-purple-400"
              }`}
            >
              <ThumbsUp className={isLiked ? "fill-current" : ""} />
              {post.reactions.likes + (isLiked ? 1 : 0)} likes
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1 ${
                isDisliked ? "text-purple-700" : "text-purple-400"
              }`}
            >
              <ThumbsDown className={isDisliked ? "fill-current" : ""} />
              {post.reactions.dislikes + (isDisliked ? 1 : 0)} dislikes
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
