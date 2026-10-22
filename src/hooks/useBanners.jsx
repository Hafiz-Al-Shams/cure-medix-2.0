// Custom hook to fetch banners from the /banners endpoint

import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";




const useBanners = () => {
    const axiosPublic = useAxiosPublic();

    const { refetch, data: banners = [] } = useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            const res = await axiosPublic.get('/banners');
            // Filter banners where isBanner is true
            return res.data.filter(banner => banner.isBanner === true);
        }
    });

    return [banners, refetch];
};

export default useBanners;