import { SugjestConfig } from './sugjest-config';

export interface SugjestConfigFile {
  version: number;
  configs: SugjestConfig[];
}
