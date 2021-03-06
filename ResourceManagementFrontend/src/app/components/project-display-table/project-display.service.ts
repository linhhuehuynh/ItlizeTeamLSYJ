import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import { Project } from 'src/app/model/project.model';
import { ProjectRow } from 'src/app/model/project-row.model';
import { ProjectColumn } from 'src/app/model/project-col.model';
import { ProjectItem } from 'src/app/model/project-item.model';
import {environment} from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { ProjectRowDisplay } from './project-row-display.model';
import { AuthService } from './../auth/auth.service';

const BACKEND_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProjectDisplayService {
  token: any;
  header: any;
  userIsAuthenticated=false;

  private project: Project;
  private projectRowList: ProjectRow[];
  private projectColList: ProjectColumn[];
  private projectRowDisplayList: ProjectRowDisplay[];
  loaded: boolean;
  tempelateChange: boolean;


  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { 
    this.project = null;
    this.projectRowList = [];
    this.projectColList = [];
    this.projectRowDisplayList = [];
    this.loaded = false;
    this.tempelateChange = false;
    //Not sure if this is correct, need to double check
    this.userIsAuthenticated = this.authService.getIsAuth();
  }

  getProjectRowList(projectId: number) {
    return this.http.get<ProjectRow[]>(BACKEND_URL + '/projectrow/project/' + projectId.toString())
    .toPromise()
    .then(res => {
      this.projectRowList = res.sort((a, b) => {return a.id - b.id});
      return this.projectRowList;
    })
  }

  getProjectColList(projectId: number) {
    return this.http.get<ProjectColumn[]>(BACKEND_URL + '/projectcolumn/project/' + projectId.toString())
    .toPromise()
    .then(res => {
      this.projectColList = res.sort((a, b) => {return a.id - b.id});
      return this.projectColList;
    })
  }

  getProjectItemList() {
    let result: ProjectRowDisplay[] = [];
    for(let projectRow of this.projectRowList) {
      let tmp = new ProjectRowDisplay();
      tmp.id = projectRow.id;
      try{
        this.http.get<ProjectItem[]>(BACKEND_URL + '/projectitem/row/' + projectRow.id.toString()).subscribe(
          data => {
            for(let item of data) {
              item.changed = false;
            }
            tmp.itemList = data.sort((a, b) => {return a.projectColumn.id - b.projectColumn.id});
            result.push(tmp);
          }
        );
      } catch(err) {
        console.error(err);
      }
    }
    this.projectRowDisplayList = result;
    return this.projectRowDisplayList;
  }

  saveChangedItems(projectRowDisplayList: ProjectRowDisplay[]) {
    for(let projectRow of projectRowDisplayList) {
      for(let item of projectRow.itemList) {
        if(item.changed) {
          this.http.put(BACKEND_URL + '/projectitem/' + item.id, 
          {
            value: item.value,
            projectRow: {id: item.projectRow.id},
            projectColumn: {id: item.projectColumn.id}
          }
          ).subscribe(data => {alert("Update Successfully!")});
          item.changed = false;
        }
      }
    }
    return projectRowDisplayList;
  }

  getLoadedProjectColumnList() {
    return this.projectColList;
  }

  getLoadedProjectRowList() {
    return this.projectRowList;
  }

  async getLoadedProjectRowDisplayList() {
    let displayRows: ProjectRowDisplay[] = [];
    for(let row of this.projectRowList) {
      let tmpRow = new ProjectRowDisplay();
      tmpRow.id = row.id;
      tmpRow.itemList = [];
      for(let col of this.projectColList) {
        await this.http.get<ProjectItem>(BACKEND_URL + '/projectitem/rowcol/' + row.id.toString() + "/" + col.id.toString()).toPromise().then(
          res => {
            tmpRow.itemList.push(res);
          }
        );
      }
      displayRows.push(tmpRow);
    }
    return displayRows;
  }

  updateData(cols: ProjectColumn[]) {
    this.projectColList = cols.sort((a, b) => {return a.id - b.id});
  }
}