import * as path from 'path';
import * as fs from 'fs';
import { getJsonDataSync, writeJsonDataSync }  from './json';
import { SEGMENTS_PATH } from '../config';
import { AnomalyUnitKey, loadPredictorById, saveAnomaly } from '../models/analytic_unit';

import * as _ from 'lodash';

function getLabeledSegments(predictorId: AnomalyUnitKey) {
  let filename = path.join(SEGMENTS_PATH, `${predictorId}_labeled.json`);

  if(!fs.existsSync(filename)) {
    return [];
  } else {
    let segments = getJsonDataSync(filename);
    for(let segment of segments) {
      if(segment.labeled === undefined) {
        segment.labeled = false;
      }
    }
    return segments;
  }
}

function getPredictedSegments(predictorId: AnomalyUnitKey) {
  let filename = path.join(SEGMENTS_PATH, `${predictorId}_segments.json`);

  let jsonData;
  try {
    jsonData = getJsonDataSync(filename);
  } catch(e) {
    console.error(e.message);
    jsonData = [];
  }
  return jsonData;
}

function saveSegments(predictorId: AnomalyUnitKey, segments) {
  let filename = path.join(SEGMENTS_PATH, `${predictorId}_labeled.json`);

  try {
    return writeJsonDataSync(filename, _.uniqBy(segments, 'start'));
  } catch(e) {
    console.error(e.message);
    throw new Error('Can`t write to db');
  }
}

function insertSegments(predictorId: AnomalyUnitKey, addedSegments, labeled:boolean) {
  // Set status
  let info = loadPredictorById(predictorId);
  let segments = getLabeledSegments(predictorId);

  let nextId = info.next_id;
  let addedIds = []
  for (let segment of addedSegments) {
    segment.id = nextId;
    segment.labeled = labeled;
    addedIds.push(nextId);
    nextId++;
    segments.push(segment);
  }
  info.next_id = nextId;
  saveSegments(predictorId, segments);
  saveAnomaly(predictorId, info);
  return addedIds;
}

function removeSegments(predictorId: AnomalyUnitKey, removedSegments) {
  let segments = getLabeledSegments(predictorId);
  for (let segmentId of removedSegments) {
    segments = segments.filter(el => el.id !== segmentId);
  }
  saveSegments(predictorId, segments);
}

export { getLabeledSegments, getPredictedSegments, saveSegments, insertSegments, removeSegments }
