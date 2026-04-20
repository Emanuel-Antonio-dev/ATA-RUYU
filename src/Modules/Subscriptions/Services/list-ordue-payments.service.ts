import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { ISubscriptionPaymentRepository } from "../Repositories/ISubscriptions-payments.repositories";

@Injectable()
export class ListOverduePaymentsService {
  constructor(
    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
  ) {}

  async execute(){
    try {
      const result = await this.paymentRepo.findOverdue();
      if(result.length === 0)
      {
        throw new NotFoundException("Sem pagamentos vencidos de momento")
      }
      return {
        success: true,
        statusCode: 200,
        message: 'Pagamentos vencidos listados',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Erro ao listar pagamentos vencidos');
    }
  }
}