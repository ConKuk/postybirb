import { Component, OnInit, Injector, forwardRef } from '@angular/core';
import { BaseWebsiteSubmissionForm, HOST_DATA } from 'src/app/websites/components/base-website-submission-form/base-website-submission-form.component';
import { TagConfig } from 'src/app/utils/components/tag-input/tag-input.component';

@Component({
  selector: 'e621-submission-form',
  templateUrl: './e621-submission-form.component.html',
  styleUrls: ['./e621-submission-form.component.css'],
  providers: [{ provide: BaseWebsiteSubmissionForm, useExisting: forwardRef(() => E621SubmissionForm) }],
  host: HOST_DATA
})
export class E621SubmissionForm extends BaseWebsiteSubmissionForm implements OnInit {

  public optionDefaults: any = {
    sourceURL: [''],
    sourceURL2: [''],
    sourceURL3: [''],
    sourceURL4: [''],
    sourceURL5: [''],
    parentId: [''],
    poolId: ['']
  };

  public tagConfig: TagConfig = {
    minTags: 4
  };

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
    if (!this.formGroup.get('options')) this.formGroup.addControl('options', this.formBuilder.group(this.optionDefaults));
  }

}
