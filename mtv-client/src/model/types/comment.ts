/**
 * The data fetched from server with RESTAPI
 */
export type CommentDataType = {
  id: string;
  text: string;
  created_by: string;
  insert_time: string;
  event?: string;
};

export type CommentsResponse = {
  comments: CommentDataType[];
};
