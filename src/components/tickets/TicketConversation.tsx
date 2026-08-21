import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { Send, MessageSquare, Lock, User, Clock, AlertCircle } from 'lucide-react';

export interface CommentItem {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal?: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    displayName?: string;
    email?: string;
  };
}

interface TicketConversationProps {
  comments: CommentItem[];
  isLoading?: boolean;
  error?: string | null;
  onSendReply: (message: string, isInternal?: boolean) => Promise<void>;
  allowInternalNotes?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export const TicketConversation: React.FC<TicketConversationProps> = ({
  comments,
  isLoading = false,
  error = null,
  onSendReply,
  allowInternalNotes = false,
  disabled = false,
  onRetry,
}) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || isSending || disabled) return;

    setIsSending(true);
    setSendError(null);

    try {
      await onSendReply(replyMessage.trim(), allowInternalNotes ? isInternalNote : false);
      setReplyMessage('');
      setIsInternalNote(false);
    } catch (err: unknown) {
      setSendError(
        err instanceof Error ? err.message : 'Failed to post reply. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-secondary" />
          <CardTitle className="text-base font-bold">Ticket Thread & Conversation</CardTitle>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {comments.length} Message{comments.length === 1 ? '' : 's'}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 md:p-6 space-y-6">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[480px] space-y-4 pr-1">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 rounded-xl" />
              <Skeleton className="h-16 w-2/3 ml-auto rounded-xl" />
              <Skeleton className="h-16 w-3/4 rounded-xl" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-red-800 dark:text-red-200 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {onRetry && (
                <Button variant="ghost" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No replies posted yet.
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Be the first to post a message or resolution detail to this ticket thread.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const authorName =
                comment.user?.displayName || comment.user?.email || 'User';
              const formattedDate = new Date(comment.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={comment.id}
                  className={`p-4 rounded-xl border space-y-2 transition-colors text-left ${
                    comment.isInternal
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                      : 'bg-slate-50 dark:bg-dark/60 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {comment.isInternal && allowInternalNotes && (
                        <Badge variant="warning" className="text-[10px] flex items-center gap-1 font-mono">
                          <Lock className="h-2.5 w-2.5" />
                          Internal Note
                        </Badge>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pl-9">
                    {comment.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          {sendError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          <TextArea
            placeholder={
              allowInternalNotes && isInternalNote
                ? 'Write an internal staff note (hidden from client)...'
                : 'Write a response to this ticket...'
            }
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            disabled={isSending || disabled || isLoading}
            className="min-h-[90px] text-sm"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {allowInternalNotes ? (
              <label className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  disabled={isSending || disabled || isLoading}
                  className="rounded border-amber-300 dark:border-amber-800 text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Post as Internal Staff Note
                </span>
              </label>
            ) : (
              <span className="text-[11px] text-slate-400">
                Replies are visible to the support engineering team.
              </span>
            )}

            <Button
              type="submit"
              variant={allowInternalNotes && isInternalNote ? 'danger' : 'secondary'}
              size="sm"
              disabled={!replyMessage.trim() || isSending || disabled || isLoading}
              className="justify-center"
            >
              <Send className={`h-3.5 w-3.5 mr-1.5 ${isSending ? 'animate-pulse' : ''}`} />
              {isSending ? 'Sending Reply...' : isInternalNote ? 'Post Internal Note' : 'Send Reply'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TicketConversation;
