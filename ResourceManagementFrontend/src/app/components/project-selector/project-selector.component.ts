import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/model/project.model';
import { ProjectSelectorService } from './project-selector.service';
import { Subscription } from 'rxjs';
import { AuthService } from './../auth/auth.service';

@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.css']
})
export class ProjectSelectorComponent implements OnInit {
  isLoading = false;
  private authStatusSub: Subscription;

  projectList: Project[];
  selectedProject: Project;

  constructor(private projectSelectorService: ProjectSelectorService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )

    this.projectSelectorService.getProjectList()
    .then(data => {
        this.projectList = data;
    });
  }

  onChangeProject() {
    console.log(this.selectedProject);
  }

}
