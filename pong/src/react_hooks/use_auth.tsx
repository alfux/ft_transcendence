// usePayload.ts
import { useState, Dispatch, SetStateAction } from 'react';
import Cookies from 'js-cookie';
import jwt, { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../THREE/Utils/jwt.interface';

type UpdateFunction = () => void;

const usePayload = (): [JwtPayload | null, Dispatch<SetStateAction<JwtPayload | null>>, UpdateFunction] => {
  const initialToken = Cookies.get('access_token');
  const initialPayload = initialToken ? jwtDecode<JwtPayload>(initialToken) : null;
  const [payload, setPayload] = useState<JwtPayload | null>(initialPayload);

  const handleUpdate: UpdateFunction = () => {
    const newToken = Cookies.get('access_token');
    const newPayload = newToken ? jwtDecode<JwtPayload>(newToken) : null;
    setPayload(newPayload);
  };

  return [payload, setPayload, handleUpdate];
};

export default usePayload;
