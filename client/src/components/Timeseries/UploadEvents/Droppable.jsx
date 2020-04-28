import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { FolderIcon } from '../../Common/icons';

class Droppable extends Component {
  listAddedFiles() {
    const { currentFiles } = this.props;
    return (
      (currentFiles.length && (
        <ul className="existing-files">
          {currentFiles.map((file) => (
            <li key={`${file.name}${file.path}`}>
              <FolderIcon />
              <span>{file.name}</span>
              <i className="remove-file" onClick={() => this.props.onRemoveFile(file)}>
                x
              </i>
            </li>
          ))}
        </ul>
      )) ||
      null
    );
  }

  render() {
    return (
      <Dropzone accept="application/json" onDrop={(acceptedFiles) => this.props.onAddFiles(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <section className="drop-zone">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>
                Drag and drop a file here, <span>or choose file</span>
              </p>
            </div>
            {this.listAddedFiles()}
          </section>
        )}
      </Dropzone>
    );
  }
}

export default Droppable;
