import { CreatePaymentDto} from '../Dtos/create-payment.dto';
import { UpdatePaymentRequestBody } from '../Dtos/update-payment.dto';

abstract class IAthelePaymentsRepositories
{
  abstract registerAthelePayment(datas: CreatePaymentDto):Promise<any>
  abstract getAthelePayments(filters:{limit: number, page: number, atheleId: string}):Promise<any>
  abstract getAllAthelePayments(filters:{limit: number, page: number, academyId: string}): Promise<any>
  abstract updateAthelePaymentStatus(id: string, datas: UpdatePaymentRequestBody):Promise<any>
}
export { IAthelePaymentsRepositories };