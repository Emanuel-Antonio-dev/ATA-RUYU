import { ValidateKeyDto } from "../Dtos/validate-key.dto";
import { DownloadKeyStatus } from 'generated/prisma/enums';

abstract class IDownloadKeysRepositories
{
    abstract registerDownloadKey(datas: ValidateKeyDto): Promise<any>
    abstract getDownloadKey(params:Partial<{id: string, usedByIp: string, key: string}>):Promise<any>
    abstract deleteDownloadKey(params:Partial<{id: string, usedByIp: string, key: string}>):Promise<any>
    abstract updateDownloadKey(id: string, data: Partial<{ status: DownloadKeyStatus; usedByIp: string; usedAt: Date }>): Promise<any>

}
export{IDownloadKeysRepositories}