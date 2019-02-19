import { ITable, DATA_TYPE } from 'jsstore';
import { FileObject } from './submission-file.table';
import { SubmissionFormData } from '../models/submission.model';

// TODO need to complete this when I have a better idea of the data structure provided by the form

export interface ISubmission {
  id: number;
  title: string;
  rating: SubmissionRating;
  schedule?: number;
  isScheduled?: boolean; // whether or not the schedule is active
  submissionType: SubmissionType;
  fileInfo?: FileObject; // not required in journal types
  fileMap?: FileMap;
  formData?: SubmissionFormData;
}

export interface FileMap {
  PRIMARY?: number;
  THUMBNAIL?: number;
  ADDITIONAL?: number[];
}

export enum SubmissionRating {
  GENERAL = 'General',
  MATURE = 'Mature',
  ADULT = 'Adult',
  EXTREME = 'Extreme'
}

export enum SubmissionType {
  SUBMISSION = 'SUBMISSION',
  JOURNAL = 'JOURNAL'
}

const SubmissionTableName: string = 'Submission';

const SubmissionTable: ITable = {
  name: SubmissionTableName,
  columns: [{
    name: 'id',
    notNull: true,
    primaryKey: true,
    autoIncrement: true
  }, {
    name: 'title',
    dataType: DATA_TYPE.String,
    default: 'New Submission'
  }, {
    name: 'rating',
    dataType: DATA_TYPE.String
  }, {
    name: 'submissionType',
    dataType: DATA_TYPE.String,
    notNull: true
  }, {
    name: 'schedule',
    dataType: DATA_TYPE.Number
  }, {
    name: 'isScheduled',
    dataType: DATA_TYPE.Boolean,
    default: false
  }, {
    name: 'fileInfo',
    dataType: DATA_TYPE.Object
  }, {
    name: 'fileMap',
    dataType: DATA_TYPE.Object
  }, {
    name: 'formData',
    dataType: DATA_TYPE.Object
  }]
}

export { SubmissionTable, SubmissionTableName }
