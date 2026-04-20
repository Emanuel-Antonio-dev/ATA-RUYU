import { SearchDataInterface } from 'src/Common/Utils/search-data-interface';
import { CreateAthleteDto } from '../Dtos/create-athlete.dto';
import { UpdateAthleteDto } from '../Dtos/update-thlete.dto';
import { AcademyStatus, AcademyType, Prisma } from 'generated/prisma/client';
import { CreatePaymentDto } from '../../../Atheles-payments/Dtos/create-payment.dto';

abstract class IAtheleRepositories
{
  abstract registerAthlete(datas: CreateAthleteDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract getAthleteDatas(id: string): Promise<any>;
  abstract getAthleteDatasByAffiliateCode(code: string): Promise<any>;
  abstract updateAthlete(id: string, datas: Partial<UpdateAthleteDto>, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract deleteAthlete(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract getAllAtheles(filters: {page:number;limit:number;academyId?:string;affiliateCode?: string;}): Promise<any>
  abstract deleteAthele(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
  abstract registerAthelePayment(datas: CreatePaymentDto):Promise<any>
  abstract getAthelePayments(filters:{limit: number, page: number, atheleId: string}):Promise<any>
  abstract getAllAthelePayments(filters:{limit: number, page: number, academyId: string}): Promise<any>

}
export { IAtheleRepositories };