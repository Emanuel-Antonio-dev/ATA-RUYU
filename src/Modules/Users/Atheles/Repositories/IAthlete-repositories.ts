import { SearchDataInterface } from 'src/Common/Utils/search-data-interface';
import { CreateAthleteDto } from '../Dtos/create-athlete.dto';
import { UpdateAthleteDto } from '../Dtos/update-thlete.dto';
import { AcademyStatus, AcademyType, Prisma } from 'generated/prisma/client';

abstract class IAtheleRepositories
{
  abstract registerAthlete(datas: CreateAthleteDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract getAthleteDatas(id: string): Promise<any>;
  abstract updateAthlete(id: string, datas: Partial<UpdateAthleteDto>, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract deleteAthlete(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract getAllAtheles(filters: {page:number;limit:number;}): Promise<any>
  abstract deleteAthele(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
}
export { IAtheleRepositories };