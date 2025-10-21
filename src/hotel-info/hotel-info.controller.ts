import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HotelInfoService } from './hotel-info.service';
import { HotelDTO, HotelDTO2LCI } from '../DTO/hotel-info.dto';
import { promises } from 'dns';

@Controller('hotel-info')
export class HotelInfoController {
  constructor(private hotelInfoService: HotelInfoService) {

  }

  @Get('all')
  getAllHotelInfo() {
    return this.hotelInfoService.getAllHotelInfo();

  }

  @Post('create')
  createNewInfo(@Body() hotelDTO: HotelDTO2LCI[]): Promise<HotelDTO2LCI[]> {
    return this.hotelInfoService.createNewInfos(hotelDTO);
  }

  @Get('findByLocation')
  findByLocation(@Query('location') location: string,
    @Query('date') date?: string,) {
   {
    
    return this.hotelInfoService.findHotelByLocation(location, date);
  }
  }

  @Get('findLateCheckIn')
  findByLateCheckIN(@Query('location') location: string,@Query('date') date: Date) {
    

    return this.hotelInfoService.findHotelsByLocationAndDate(location,date)
  }

}



