import React from 'react';

const optionsKnown = [
  { label: 'Investigate', icon: 'investigate' },
  { label: 'Do not Investigate', icon: 'not_investigate' },
  { label: 'Postpone', icon: 'postpone' },
];

const optionsUnknown = [
  { label: 'Problem', icon: 'problem' },
  { label: 'Previously seen', icon: 'seen' },
  { label: 'Normal', icon: 'normal' },
];

export const grouppedOptions = [
  {
    label: 'Known',
    options: optionsKnown,
  },
  {
    label: 'Unknown',
    options: optionsUnknown,
  },
];

export const formatOptionLabel = ({ label, icon }) => (
  <div className="select-row">
    <i className={`select ${icon}`} />
    {label}
  </div>
);

export const RenderComments = eventComments =>
  eventComments.comments && eventComments.comments.length ? (
    eventComments.comments.map(comment => (
      <div key={comment.id} className="comment">
        <p>
          <span>{(comment.created_by && comment.created_by) || 'Anonymous'}: </span> {comment.text}
        </p>
      </div>
    ))
  ) : (
    <p>This event has no comments</p>
  );

export const selectedOption = selectedLabel =>
  selectedLabel === null
    ? ''
    : grouppedOptions
        .reduce((known, unknown) => [...known.options, ...unknown.options])
        .find(({ label }) => label === selectedLabel);
