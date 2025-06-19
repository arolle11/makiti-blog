import { Link } from "react-router-dom";
import type { Post } from "../types/types";
import image from "../assets/image.png";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState, useEffect } from "react";

interface CardPostProps {
  post: Post;
}

const CardPost = ({ post }: CardPostProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    // Vérifier les likes/dislikes au montage du composant
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    const dislikedPosts = JSON.parse(
      localStorage.getItem("dislikedPosts") || "{}"
    );

    setIsLiked(!!likedPosts[post.id]);
    setIsDisliked(!!dislikedPosts[post.id]);
  }, [post.id]);

  const handleLike = () => {
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

  return (
    <div className="w-80 p-4 bg-white rounded-lg shadow-md border border-purple-100 space-y-4 hover:shadow-xl transition-shadow">
      <img src={image} alt="post" className="w-full h-40 object-cover" />
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        By {post.user ? post.user.firstName + post.user.lastName : ""}
      </p>
      <h2 className="text-lg font-semibold text-purple-700 line-clamp-2">
        {post.title}
      </h2>
      <p className="text-gray-600 line-clamp-2">{post.body}</p>
      <div className="flex justify-between items-center text-sm text-purple-500">
        <span>Views: {post.views}</span>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-1 ${
              isLiked ? "text-purple-700" : "text-purple-400"
            }`}
          >
            <ThumbsUp className={isLiked ? "fill-current" : ""} />
            {post.reactions.likes + (isLiked ? 1 : 0)}
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center justify-center gap-1 ${
              isDisliked ? "text-purple-700" : "text-purple-400"
            }`}
          >
            <ThumbsDown className={isDisliked ? "fill-current mt-2" : "mt-2"} />
            {post.reactions.dislikes + (isDisliked ? 1 : 0)}
          </button>
        </div>
      </div>
      <Link
        to={`/post/${post.id}`}
        className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
      >
        Read more →
      </Link>
    </div>
  );
};

export default CardPost;
