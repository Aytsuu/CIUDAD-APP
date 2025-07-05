import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useAddAR = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        console.log(data)
        const res = await api.post('report/ar/create/', data);
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}

export const useAddARFile = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>[]) => {
      try {
        const res = await api.post('report/ar/file/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
  })
}

export const useAddWAR = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('report/war/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}

export const useAddWARComp = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>[]) => {
      try {;
        const res = await api.post('report/war/comp/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}

export const useAddWARFile = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>[]) => {
      try {
        const res = await api.post('report/war/file/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
  })
}
