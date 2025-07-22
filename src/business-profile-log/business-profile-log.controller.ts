import { Controller } from '@nestjs/common';
import { BusinessProfileLogService } from './business-profile-log.service';

@Controller('business-profile-log')
export class BusinessProfileLogController {
  constructor(private readonly businessProfileLogService: BusinessProfileLogService) {}
}
