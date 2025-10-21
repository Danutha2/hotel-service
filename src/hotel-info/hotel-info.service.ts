import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Hotel } from 'src/entity/hotel.entity';
import { HotelDTO, HotelDTO2LCI } from '../DTO/hotel-info.dto';

@Injectable()
export class HotelInfoService {
  private readonly logger = new Logger(HotelInfoService.name);

  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) { }

  async getAllHotelInfo() {
    this.logger.log('Fetching all hotels from database...');
    try {
      const hotels = await this.hotelRepository.find();
      this.logger.log(`Fetched ${hotels.length} hotels successfully.`);
      return hotels;
    } catch (error) {
      this.logger.error(`Failed to fetch hotels: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch hotel information. Please try again later.');
    }
  }

  async createNewInfos(hotelDTOs: HotelDTO2LCI[]): Promise<HotelDTO2LCI[]> {
    this.logger.log(`Creating ${hotelDTOs.length} new hotel entries...`);
    try {
      const hotels = this.hotelRepository.create(hotelDTOs);
      const savedHotels = await this.hotelRepository.save(hotels);
      this.logger.log(`Successfully created ${savedHotels.length} hotels.`);
      return savedHotels;
    } catch (error) {
      this.logger.error(`Failed to create hotels: ${error.message}`);
      throw new InternalServerErrorException('Failed to create hotel entries. Please try again later.');
    }
  }

async findHotelByLocation(location?: string, date?: string) {
  this.logger.log(
    `Searching hotels | location=${location ?? 'ALL'}, date=${date ?? 'ALL'}`,
  );

  try {
    const whereCondition: any = {};

    if (location) {
      whereCondition.location = location;
    }

    if (date) {
      const checkIn = new Date(date);
      const start = new Date(checkIn);
      start.setHours(0, 0, 0, 0);

      const end = new Date(checkIn);
      end.setHours(23, 59, 59, 999);

      whereCondition.date = Between(start, end);
    }

    const hotels = await this.hotelRepository.find(
      Object.keys(whereCondition).length > 0
        ? { where: whereCondition }
        : {},
    );

    if (!hotels || hotels.length === 0) {
      if (location || date) {
        this.logger.warn(
          `No hotels found for filters: ${location ? `location=${location}` : ''} ${date ? `date=${new Date(date).toDateString()}` : ''}`,
        );
        throw new NotFoundException(
          `No hotels found with the given filters.`,
        );
      } else {
        this.logger.warn(`No hotels found in the system`);
        throw new NotFoundException(`No hotels found`);
      }
    }

    this.logger.debug(
      `Found ${hotels.length} hotel(s) for filters: ${location ? `location=${location}` : 'ALL'} ${date ? `date=${new Date(date).toDateString()}` : 'ALL'}`,
    );

    return hotels;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.logger.error(
      `Failed to fetch hotels | location=${location ?? 'ALL'}, error=${error.message}`,
      error.stack,
    );
    throw new InternalServerErrorException(
      'Failed to fetch hotel information. Please try again later.',
    );
  }
}




  async findHotelsByLocationAndDate(location?: string, date?: Date) {
    this.logger.log(`Searching hotels with filters - location: ${location}, date: ${date}`);
    try {
      // Build dynamic where object
      const where: any = {};
      if (location) where.location = location;
      if (date){
        const departDate = new Date(date); 

        const start = new Date(departDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(departDate);
        end.setHours(23, 59, 59, 999);

        where.date = departDate;

      }  

      const hotels = await this.hotelRepository.find({ where });

      if (!hotels || hotels.length === 0) {
        this.logger.warn(`No hotels found with the given filters - location: ${location}, date: ${date}`);
        throw new NotFoundException(`No hotels found with the provided filters.`);
      }

      this.logger.log(`Found ${hotels.length} hotel(s) with the given filters.`);
      return hotels;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Failed to fetch hotels with filters - location: ${location}, date: ${date}: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to fetch hotels. Please try again later.');
    }
  }

}
