import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useMedicines = () => {
    const axiosPublic = useAxiosPublic();

    const { data: medicines = [], isLoading, error } = useQuery({
        queryKey: ['medicines'],
        queryFn: async () => {
            const res = await axiosPublic.get('/medicines');
            return res.data;
        }
    });

    return { medicines, isLoading, error };
};

export default useMedicines;