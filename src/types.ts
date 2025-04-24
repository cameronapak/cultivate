import {
  Project as BaseProject,
  Task as BaseTask,
  Resource as BaseResource,
  Pitch as BasePitch,
  Thought as BaseThought
} from "wasp/entities";

export interface Task extends BaseTask {}

export interface Resource extends BaseResource {}

export interface Pitch extends BasePitch {}

export interface Thought extends BaseThought {}

export interface Project extends BaseProject {
  tasks?: Task[];
  resources?: Resource[];
  pitch?: Pitch | null;
  thoughts?: Thought[];
} 