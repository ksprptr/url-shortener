'use client';

import axios, { AxiosError } from 'axios';

/**
 * Http client to make requests to the server
 */
export const useHttpClient = () => {
  /**
   * Create an axios client
   */
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  /**
   * GET request to the server
   */
  const httpGet = async (url: string) => {
    try {
      return await client.get(url);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (!axiosError.response) {
        throw axiosError;
      }

      return axiosError.response;
    }
  };

  /**
   * POST request to the server
   */
  const httpPost = async (url: string, data: any) => {
    try {
      return await client.post(url, data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (!axiosError.response) {
        throw axiosError;
      }

      return axiosError.response;
    }
  };

  return { httpGet, httpPost };
};
