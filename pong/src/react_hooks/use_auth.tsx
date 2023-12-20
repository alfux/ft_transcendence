// usePayload.ts
import { useState, Dispatch, SetStateAction } from 'react';
import Cookies from 'js-cookie';
import jwt, { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../THREE/Utils/jwt.interface';

type UpdateFunction = () => void;

const usePayload = (): [JwtPayload | undefined, Dispatch<SetStateAction<JwtPayload | undefined>>, UpdateFunction] => {
  const initialToken = Cookies.get('access_token');
  const initialPayload = initialToken ? jwtDecode<JwtPayload>(initialToken) : undefined;
  const [payload, setPayload] = useState<JwtPayload | undefined>(initialPayload);

  const handleUpdate: UpdateFunction = () => {
    const newToken = Cookies.get('access_token');
    const newPayload = newToken ? jwtDecode<JwtPayload>(newToken) : undefined;
    setPayload(newPayload);
  };

  return [payload, setPayload, handleUpdate];
};

export default usePayload;
