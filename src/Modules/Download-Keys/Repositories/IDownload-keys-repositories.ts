import { ValidateKeyDto } from "../Dtos/validate-key.dto";
import { DownloadKeyStatus } from 'generated/prisma/enums';

abstract class IDownloadKeysRepositories
{
    abstract registerDownloadKey(datas: ValidateKeyDto): Promise<any>
    abstract getDownloadKey(params:Partial<{id: string, usedByIp: string, key: string}>):Promise<any>
    abstract deleteDownloadKey(params:Partial<{id: string, usedByIp: string, key: string}>):Promise<any>
    abstract updateDownloadKey(id: string, data: Partial<{ status: DownloadKeyStatus; usedByIp: string; usedAt: Date }>): Promise<any>
    // ✅ B-06 FIX: update atómico condicionado ao status ainda ser ACTIVE —
    // devolve quantas linhas foram alteradas (0 ou 1), nunca a linha em si,
    // para que o service saiba se GANHOU a corrida ou não.
    abstract markKeyAsUsedAtomic(id: string, usedByIp: string): Promise<{ count: number }>

}
export{IDownloadKeysRepositories}