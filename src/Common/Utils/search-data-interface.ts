interface SearchDataInterface
{
    action: "OnlyBasicsDatas" | "AllDatas";
    filter_by?: Record<string, any>;
    sort_by?: {
        field: string;
        order: "asc" | "desc";
    };
    page?: number;
    limit?: number;
}
export{SearchDataInterface}