import { Component, OnInit, OnDestroy, AfterContentInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { WebsiteManagerService } from '../../../../../../commons/services/website-manager/website-manager.service';
import { Subscription } from 'rxjs/Subscription';
import { SupportedWebsites } from '../../../../../../commons/enums/supported-websites';
import { BaseControlValueAccessorComponent } from '../../../../../../commons/components/base-control-value-accessor/base-control-value-accessor.component';

@Component({
  selector: 'sofurry-folders',
  templateUrl: './sofurry-folders.component.html',
  styleUrls: ['./sofurry-folders.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SofurryFoldersComponent),
      multi: true,
    }
  ]
})
export class SofurryFoldersComponent extends BaseControlValueAccessorComponent implements OnInit, OnDestroy, AfterContentInit, ControlValueAccessor {
  private statusSubscription: Subscription;
  public folders: any[];

  constructor(private service: WebsiteManagerService) {
    super();
  }

  ngOnInit() {
    this.value = '';
    this.folders = [];
  }

  ngAfterContentInit() {
    this.populateFolders(this.service.getOther(SupportedWebsites.SoFurry).folders);
    this.statusSubscription = this.service.getObserver().subscribe((statuses) => {
      if (statuses[SupportedWebsites.SoFurry]) {
        this.populateFolders(this.service.getOther(SupportedWebsites.SoFurry).folders);
      }
    });
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
  }

  populateFolders(folders: any): void {
    this.folders = [];
    if (folders) {
      folders.forEach((folder) => {
        const folderItem = {
          value: folder.value,
          label: folder.name
        };

        this.folders.push(folderItem);
      });
    } else {
      this.value = '';
    }
  }

  public onChange(event: any) {
    this.onChangedCallback(event.value);
  }

}
