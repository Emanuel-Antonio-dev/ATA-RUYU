import { AcademyStatus, AcademyType, Prisma } from "generated/prisma/client";
import { CreateAcademyDto } from "../Dtos/create-academy.dto";
import { UpdateAcademyRequestDto } from "../Dtos/update-academy.dto";
import { SearchDataInterface } from "src/Common/Utils/search-data-interface";

abstract class IAcademiesRepositories
{
  abstract createAcademy(datas: CreateAcademyDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract findAcademyById(mode:SearchDataInterface ,id?: string, name?: string): Promise<any>;
  //abstract findAcademiesByStatus(status: string): Promise<any[]>;
  //abstract updateAcademyStatus(id: string, status: string, tx: any): Promise<any>;

  abstract updateAcademy(id: string, datas: Partial<UpdateAcademyRequestDto>, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
  abstract setAcademyStatus(id: string, status: AcademyStatus):Promise<any>
  abstract deleteAcademy(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>;
// Repositories/IAcademies-repositories.ts
  abstract findAllAcademies(filters: {status?: AcademyStatus;type?: AcademyType ;page:number;limit:number;}): Promise<any>;
  abstract getAffiliateReport(academyId: string):Promise<any>
  abstract getCentralReport():Promise<any>


}
export { IAcademiesRepositories };