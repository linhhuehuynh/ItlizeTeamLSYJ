import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../environments/environment';
import { ResourceItem } from './resource-item.model';
import { Resource } from './../resource-data.model';
import { ResourceRow } from './../resource-row/resource-row.model';
import { ResourceService } from './../resource.service';
import { Observable } from 'rxjs';

const BACKEND_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class ResourceItemService {
  private resources: Resource[];
  private resourceRowList: ResourceRow[];

  constructor(private http: HttpClient, private resource:ResourceService) {
    this.resources = [];
    this.resourceRowList = []
   }

   getResource() {
    return this.http.get<Resource[]>(BACKEND_URL + '/resource')
    .toPromise()
    .then(res => {
      this.resources = res;
      return this.resources;
    })
  }

  async getResourceItemList() {
    if(this.resourceRowList.length === 0) {
      for (let resource of this.resources) {
        let row = new ResourceRow();
        row.resource = resource;
        await this.http.get<ResourceItem[]>(BACKEND_URL + '/resourceitem/resource/' + row.resource.id.toString()).toPromise()
        .then(response => {
          if (response == null ) {this.resourceRowList.push(row)}
          else {
            row.itemList = response.sort((a, b) => {return a.resourceColumn.id - b.resourceColumn.id})
            this.resourceRowList.push(row);
          }
        });
      }
    }
    // console.log(this.resourceRowList);
    return this.resourceRowList;
  }
}
