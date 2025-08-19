import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Calendar, User, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      setIsLiking(true);
      const response = await postsAPI.like(post._id);
      setIsLiked(response.data.liked);
      setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <article className="card hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/users/${post.author._id}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=3b82f6&color=fff`}
              alt={post.author.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">
                {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-4">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="mb-4">
        <Link to={`/posts/${post._id}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        <p className="text-gray-600 leading-relaxed">
          {truncateText(post.content)}
        </p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          
          <Link 
            to={`/posts/${post._id}`}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments?.length || 0}</span>
          </Link>
          
          <div className="flex items-center space-x-1 text-gray-500">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-medium">{post.viewCount || 0}</span>
          </div>
        </div>

        <Link
          to={`/posts/${post._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
};

export default PostCard;
