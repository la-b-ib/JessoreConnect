
import React, { useState, useEffect, useRef } from 'react';
import { Post, User, Language, Comment, AppNotification } from '../types';
import { INITIAL_POSTS } from '../data/mockData';
import { TRANSLATIONS } from '../translations';
import { sanitizeHtml, isRateLimited } from '../services/securityService';

interface CommunityFeedProps {
  user: User | null;
  onLoginRequest: () => void;
  language?: Language;
  onAddNotification?: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

type SortOption = 'newest' | 'likes' | 'comments';

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
    user, 
    onLoginRequest, 
    language = 'en',
    onAddNotification
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'review' | 'blog'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isPosting, setIsPosting] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  
  // Interaction State
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  
  // Nested Reply State
  const [replyingTo, setReplyingTo] = useState<{ postId: string, commentId: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  const t = TRANSLATIONS[language];
  const menuRef = useRef<HTMLDivElement>(null);
  
  // New Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'review' | 'blog' | 'discussion'>('discussion');
  const [newPostRating, setNewPostRating] = useState(0);
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('jashore_community_posts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        setPosts(INITIAL_POSTS);
      }
    } else {
      setPosts(INITIAL_POSTS);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save to LocalStorage whenever posts change
  const updatePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('jashore_community_posts', JSON.stringify(newPosts));
  };

  const handleLike = (postId: string) => {
    if (isRateLimited(user?.id || 'anon', 'like', 1000)) return;
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    );
    updatePosts(updatedPosts);
  };

  const getAuthorProfile = (): User => {
    if (!user || postAsAnonymous) {
      return {
        id: `anon_${Date.now()}`,
        name: 'Anonymous',
        email: '',
        avatar: 'https://ui-avatars.com/api/?name=?&background=cbd5e1&color=fff'
      };
    }
    return user;
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const author = getAuthorProfile();
    if (isRateLimited(author.id, 'post', 30000)) {
        setSecurityAlert("Please wait before posting again (Anti-Spam).");
        setTimeout(() => setSecurityAlert(null), 5000);
        return;
    }
    const sanitizedTitle = sanitizeHtml(newPostTitle);
    const sanitizedContent = sanitizeHtml(newPostContent);
    const newPost: Post = {
      id: Date.now().toString(),
      author: author,
      title: sanitizedTitle,
      content: sanitizedContent,
      type: newPostType,
      rating: newPostType === 'review' ? newPostRating : undefined,
      likes: 0,
      comments: [],
      timestamp: new Date().toLocaleDateString(),
      tags: []
    };
    updatePosts([newPost, ...posts]);
    setIsPosting(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostRating(0);
    setPostAsAnonymous(false);
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const countTotalComments = (comments: Comment[]): number => {
    let count = comments.length;
    comments.forEach(c => {
      if (c.replies && c.replies.length > 0) {
        count += countTotalComments(c.replies);
      }
    });
    return count;
  };

  const addReplyToTree = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return comments.map(c => {
        if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: addReplyToTree(c.replies, parentId, newReply) };
        }
        return c;
    });
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;
    const author = getAuthorProfile();
    if (isRateLimited(author.id, 'comment', 5000)) return;
    const { postId, commentId } = replyingTo;
    const sanitizedReply = sanitizeHtml(replyText);
    const newReply: Comment = {
        id: `c_${Date.now()}`,
        authorId: author.id,
        authorName: author.name,
        content: sanitizedReply,
        timestamp: 'Just now',
        replies: []
    };
    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            return { 
                ...p, 
                comments: addReplyToTree(p.comments, commentId, newReply) 
            };
        }
        return p;
    });
    updatePosts(updatedPosts);
    setReplyingTo(null);
    setReplyText('');
  };

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    const author = getAuthorProfile();
    if (isRateLimited(author.id, 'comment', 5000)) return;
    const sanitizedComment = sanitizeHtml(content);
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      authorId: author.id,
      authorName: author.name,
      content: sanitizedComment,
      timestamp: 'Just now',
      replies: []
    };
    const targetPost = posts.find(p => p.id === postId);
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    updatePosts(updatedPosts);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    if (onAddNotification && targetPost && targetPost.author.id === user?.id) {
        onAddNotification({
            type: 'comment',
            title: t.newCommentNotif,
            message: `${author.name} commented: "${content.slice(0, 30)}..."`,
            link: postId
        });
    }
    const newExpanded = new Set(expandedComments);
    newExpanded.add(postId);
    setExpandedComments(newExpanded);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t.reportSuccess);
    setReportingPostId(null);
    setReportReason('spam');
    setReportDetails('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {[1, 2, 3, 4, 5].map((star) => (
          <i key={star} className={`fa-star ${star <= rating ? 'fa-solid' : 'fa-regular'}`}></i>
        ))}
      </div>
    );
  };

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).sort();

  const filteredAndSortedPosts = posts
    .filter(p => {
      const matchesTab = activeTab === 'all' || p.type === activeTab;
      const matchesTag = activeTag ? p.tags?.includes(activeTag) : true;
      return matchesTab && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'comments') return countTotalComments(b.comments) - countTotalComments(a.comments);
      return b.id.localeCompare(a.id);
    });

  const renderComment = (comment: Comment, postId: string, depth = 0) => {
    const isReplying = replyingTo?.postId === postId && replyingTo?.commentId === comment.id;
    return (
        <div key={comment.id} className={`${depth > 0 ? 'ml-6 md:ml-8 mt-3 border-l-2 border-slate-100 dark:border-slate-700 pl-3 md:pl-4' : 'mt-4'}`}>
             <div className="flex items-start text-sm group/comment">
                <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-2 mt-0.5 shrink-0 text-xs text-slate-500 dark:text-slate-300">
                    {comment.authorName === 'Anonymous' ? <i className="fa-solid fa-user-secret"></i> : comment.authorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mr-2 text-xs">
                            {comment.authorName === 'Anonymous' ? t.anonymous : comment.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
                    <div className="flex items-center gap-4 mt-1">
                        <button onClick={() => { setReplyingTo({ postId, commentId: comment.id }); setReplyText(''); }} className="text-xs font-semibold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center">
                            <i className="fa-solid fa-reply mr-1 text-[10px]"></i> {t.reply}
                        </button>
                    </div>
                    {isReplying && (
                        <div className="mt-2 animate-fadeIn">
                             <form onSubmit={handleReplySubmit} className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                <span className="text-xs text-slate-400 flex items-center">
                                    <i className="fa-solid fa-share fa-flip-vertical mr-1"></i> {t.replyingTo} {comment.authorName}
                                </span>
                                <div className="flex gap-2">
                                    <input autoFocus type="text" className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 dark:text-white" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={t.writeComment} />
                                    <button type="submit" disabled={!replyText.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md px-3 py-1 text-xs font-medium transition-colors">{t.send}</button>
                                    <button type="button" onClick={() => setReplyingTo(null)} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-md px-2 py-1 text-xs font-medium transition-colors"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                             </form>
                        </div>
                    )}
                </div>
             </div>
             {comment.replies && comment.replies.length > 0 && (
                <div>{comment.replies.map(reply => renderComment(reply, postId, depth + 1))}</div>
             )}
        </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Security Alerts */}
      {securityAlert && (
          <div className="mb-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 p-3 rounded-xl flex items-center text-orange-700 dark:text-orange-400 text-sm animate-bounce">
              <i className="fa-solid fa-shield-halved mr-3"></i>
              {securityAlert}
          </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.communityTitle}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.communitySubtitle}</p>
        </div>
        {!isPosting && (
          <button onClick={() => setIsPosting(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-medium shadow-md transition-all flex items-center">
            <i className="fa-solid fa-plus mr-2"></i> {t.createPost}
          </button>
        )}
      </div>

      {/* Create Post Form */}
      {isPosting && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t.createPostTitle}</h3>
            <button onClick={() => setIsPosting(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center">
                    {user && !postAsAnonymous ? (
                        <><img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl mr-2" /><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.loginToPostName} {user.name}</span></>
                    ) : (
                         <><div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-600 flex items-center justify-center mr-2"><i className="fa-solid fa-user-secret text-slate-500 dark:text-slate-400"></i></div><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.loginToPostName} {t.anonymous}</span></>
                    )}
                </div>
                {user ? (
                     <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={postAsAnonymous} onChange={(e) => setPostAsAnonymous(e.target.checked)} className="form-checkbox h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                        <span className="ml-2 text-xs text-slate-600 dark:text-slate-400 font-medium select-none">{t.postAsAnonymous}</span>
                     </label>
                ) : (
                    <button type="button" onClick={onLoginRequest} className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">{t.signIn}</button>
                )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.postType}</label>
              <div className="flex gap-2">
                {(['discussion', 'review', 'blog'] as const).map(type => (
                  <button type="button" key={type} onClick={() => setNewPostType(type)} className={`px-4 py-1.5 rounded-full text-sm font-medium border ${newPostType === type ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                ))}
              </div>
            </div>
            {newPostType === 'review' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{t.postRating}</label>
                <div className="flex gap-1 text-2xl text-slate-300 dark:text-slate-600">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setNewPostRating(star)} className={`hover:text-yellow-400 transition-colors ${newPostRating >= star ? 'text-yellow-400' : ''}`}><i className="fa-solid fa-star"></i></button>
                  ))}
                </div>
              </div>
            )}
            <div><input type="text" placeholder={t.postTitlePlaceholder} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} required /></div>
            <div><textarea placeholder={t.postContentPlaceholder} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none h-32 resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} required /></div>
            <div className="flex justify-end pt-2"><button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700">{t.postButton}</button></div>
          </form>
        </div>
      )}

      {/* Main Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6 gap-4">
        <div className="flex space-x-6">
          {[{ id: 'all', label: t.allPosts }, { id: 'review', label: t.reviews }, { id: 'blog', label: t.blogs }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              {tab.label}
              {activeTab === tab.id && (<span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-t-full"></span>)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pb-3 md:pb-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center"><i className="fa-solid fa-arrow-down-wide-short mr-2"></i> {t.sortBy}:</span>
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
            {[{ id: 'newest', icon: 'fa-clock', label: t.newest }, { id: 'likes', icon: 'fa-heart', label: t.mostLiked }, { id: 'comments', icon: 'fa-comment', label: t.mostCommented }].map(option => (
              <button key={option.id} onClick={() => setSortBy(option.id as SortOption)} title={option.label} className={`flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${sortBy === option.id ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}><i className={`fa-solid ${option.icon} mr-1.5`}></i><span className="hidden sm:inline">{option.label}</span></button>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fadeIn">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-1.5 mr-2 flex items-center"><i className="fa-solid fa-filter mr-1"></i> {t.suggestedTopics}:</span>
            {allTags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${activeTag === tag ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'}`}><i className="fa-solid fa-hashtag mr-1 opacity-50"></i>{tag}</button>
            ))}
            {activeTag && (<button onClick={() => setActiveTag(null)} className="px-2 py-1 text-xs text-red-500 hover:text-red-600 font-medium ml-2"><i className="fa-solid fa-times mr-1"></i> Clear</button>)}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400"><i className="fa-regular fa-comment-dots text-4xl mb-3 opacity-50"></i><p>No posts found matching your criteria.</p>{activeTag && (<button onClick={() => setActiveTag(null)} className="text-emerald-600 hover:underline text-sm mt-2">Clear filters</button>)}</div>
        ) : filteredAndSortedPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-xl mr-3" />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{post.author.name === 'Anonymous' ? t.anonymous : post.author.name}</h4>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400"><span>{post.timestamp}</span><span className="mx-1">•</span><span className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-medium ${post.type === 'review' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : post.type === 'blog' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>{post.type}</span></div>
                </div>
              </div>
              <div className="relative" ref={openMenuId === post.id ? menuRef : null}>
                 <button onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                 </button>
                 {openMenuId === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 py-1 animate-fadeIn">
                        <button onClick={() => { setReportingPostId(post.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center">
                            <i className="fa-solid fa-triangle-exclamation mr-2"></i> {t.reportPost}
                        </button>
                    </div>
                 )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1" dangerouslySetInnerHTML={{ __html: post.title }}></h3>
              {/* Corrected 'rating' to 'post.rating' to resolve undefined variable error */}
              {post.type === 'review' && post.rating && (
                <div className="flex items-center mb-2">{renderStars(post.rating)}{post.location && <span className="text-xs text-slate-500 dark:text-slate-400 ml-2"><i className="fa-solid fa-location-dot mr-1"></i>{post.location}</span>}</div>
              )}
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content }}></p>
              {post.tags && post.tags.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">{post.tags.map(tag => (<button key={tag} onClick={() => setActiveTag(tag)} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${activeTag === tag ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>#{tag}</button>))}</div>)}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex space-x-4">
                <button onClick={() => handleLike(post.id)} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm group"><div className="p-1.5 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 mr-1"><i className="fa-regular fa-heart group-hover:fa-solid"></i></div><span>{post.likes}</span></button>
                <button onClick={() => toggleComments(post.id)} className={`flex items-center transition-colors text-sm group ${expandedComments.has(post.id) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'}`}><div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 mr-1"><i className="fa-regular fa-comment"></i></div><span>{countTotalComments(post.comments)} {t.comments}</span></button>
                <button className="flex items-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors text-sm group"><div className="p-1.5 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 mr-1"><i className="fa-solid fa-share"></i></div><span>{t.share}</span></button>
              </div>
            </div>
            
            {expandedComments.has(post.id) && (
              <div className="mt-3 pt-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 animate-fadeIn">
                 {post.comments.length > 0 && (<div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">{post.comments.map(comment => renderComment(comment, post.id))}</div>)}
                 <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                    <input type="text" placeholder={t.writeComment} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 dark:text-white" value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} />
                    <button type="submit" disabled={!commentInputs[post.id]?.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"><i className="fa-solid fa-paper-plane text-xs"></i></button>
                 </form>
              </div>
            )}
            
            {!expandedComments.has(post.id) && post.comments.length > 0 && (
                <div onClick={() => toggleComments(post.id)} className="mt-3 pt-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-start text-sm"><span className="font-semibold text-slate-800 dark:text-slate-200 mr-2">{post.comments[post.comments.length - 1].authorName === 'Anonymous' ? t.anonymous : post.comments[post.comments.length - 1].authorName}:</span><span className="text-slate-600 dark:text-slate-400 line-clamp-1" dangerouslySetInnerHTML={{ __html: post.comments[post.comments.length - 1].content }}></span></div>
                    {post.comments.length > 1 && (<div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">{t.viewAllComments} ({countTotalComments(post.comments)})</div>)}
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                        <i className="fa-solid fa-triangle-exclamation mr-3 text-red-500"></i>
                        {t.reportPost}
                    </h2>
                    <button onClick={() => setReportingPostId(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>
                <form onSubmit={handleReportSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.reportReason}</label>
                        <select 
                            value={reportReason} 
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100"
                        >
                            <option value="spam">{t.reportSpam}</option>
                            <option value="harassment">{t.reportHarassment}</option>
                            <option value="inappropriate">{t.reportInappropriate}</option>
                            <option value="misinformation">{t.reportMisinformation}</option>
                            <option value="other">{t.reportOther}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.reportDetails}</label>
                        <textarea 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 h-24 resize-none"
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            placeholder="..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setReportingPostId(null)} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">{t.cancel}</button>
                        <button type="submit" className="flex-2 py-3 px-6 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">{t.reportSubmit}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
