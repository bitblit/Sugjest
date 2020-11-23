import { Logger } from '@bitblit/ratchet/dist/common/logger';
import { MapRatchet } from '@bitblit/ratchet/dist/common/map-ratchet';
import * as fs from 'fs';
import * as path from 'path';
import { SugjestConfig } from './sugjest-config';
import { SugjestConfigFile } from './sugjest-config-file';
import { SugjestDescribe, SugjestIt, SugjestOptions } from './sugjest-types';

export class Sugjest {
  public static DEFAULT_FILE: string = 'sugjest.json';
  public static ENV_VAR_NAME: string = 'SUGJEST';

  protected readonly config: SugjestConfig;
  private readonly filePath: string;

  constructor(private namespace: string) {
    if (!namespace) {
      throw new Error('You must provide a namespace');
    }

    this.filePath = process.env[Sugjest.ENV_VAR_NAME] || path.join(process.cwd(), Sugjest.DEFAULT_FILE);

    if (!fs.existsSync(this.filePath)) {
      throw new Error('Sugjest file not found (using "' + this.filePath + '")');
    }
    const fullFile: SugjestConfigFile = JSON.parse(fs.readFileSync(this.filePath).toString());

    const finder: SugjestConfig[] = fullFile.configs.filter((c) => namespace === c.namespace);
    if (finder.length === 0) {
      throw new Error('Namespace not found in file ' + this.filePath);
    } else if (finder.length > 1) {
      throw new Error('Namespace found more than once in ' + this.filePath);
    } else {
      this.config = finder[0];
      Logger.debug('Sugjest configured to %j', this.config);
    }
  }

  public static create(options: SugjestOptions): [SugjestDescribe, SugjestIt] {
    const instance = new Sugjest(options.namespace);
    return [instance.createDescribe(options), instance.createIt(options)];
  }

  private createDescribe(options: SugjestOptions): SugjestDescribe {
    return this.shouldSkip(options) ? describe.skip : describe;
  }

  private createIt(options: SugjestOptions): SugjestIt {
    return this.shouldSkip(options) ? it.skip : it;
  }

  public filterToEnabled(inTagList: string[]): string[] {
    const tagList: string[] = inTagList || [];
    const filtered: string[] = tagList.filter((t) => this.config.enabledTags.indexOf(t) > -1);
    Logger.silly('Filtered %j to %j', inTagList, filtered);
    return filtered;
  }

  public allEnabled(inTagList: string[]): boolean {
    const tagList: string[] = inTagList || [];
    return this.filterToEnabled(tagList).length == tagList.length;
  }

  public anyEnabled(inTagList: string[]): boolean {
    const tagList: string[] = inTagList || [];
    return this.filterToEnabled(tagList).length > 0;
  }

  public allDisabled(inTagList: string[]): boolean {
    return !this.anyEnabled(inTagList);
  }

  public anyDisabled(inTagList: string[]): boolean {
    return !this.allEnabled(inTagList);
  }

  public paramsPresent(inParamList: string[]): boolean {
    const paramList: string[] = inParamList || [];
    let rval: boolean = true;
    paramList.forEach((p) => {
      rval = rval && !!this.param(p);
    });
    return rval;
  }

  public param<T>(name: string): T {
    let rval: T = null;

    if (this.config.parameters) {
      const pth: string[] = name.split('.');
      rval = MapRatchet.findValue(this.config.parameters, pth) as T;
    }

    return rval;
  }

  public shouldSkip({ reqParams = [], enabledTags = [] }: SugjestOptions): boolean {
    let rval: boolean = false;
    if (!this.paramsPresent(reqParams)) {
      rval = true;
      Logger.debug('Missing param, skipping');
    }
    if (this.anyDisabled(enabledTags)) {
      rval = true;
      Logger.debug('At least one disabled, skipping');
    }
    return rval;
  }
}
