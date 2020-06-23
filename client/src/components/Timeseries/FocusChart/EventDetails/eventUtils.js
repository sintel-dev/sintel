import React from 'react';
import { grouppedOptions } from '../../../Common/Dropdown';

export const RenderComments = (eventComments) =>
  eventComments.comments && eventComments.comments.length ? (
    eventComments.comments.map((comment) => (
      <div key={comment.id} className="comment">
        <p>
          <span>{(comment.created_by && comment.created_by) || 'Anonymous'}: </span> {comment.text}
        </p>
      </div>
    ))
  ) : (
    <p>This event has no comments</p>
  );

export const selectedOption = (selectedLabel) =>
  selectedLabel === null || selectedLabel === 'Untagged'
    ? 'Select a tag'
    : grouppedOptions
        .reduce((known, unknown) => [...known.options, ...unknown.options])
        .find(({ label }) => label === selectedLabel);
