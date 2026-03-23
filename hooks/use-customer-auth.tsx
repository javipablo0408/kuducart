"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredCustomerToken,
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerMe,
  getCustomerOrders,
  getStoredCustomerToken,
  loginCustomer,
  registerCustomer,
  updateCustomerAddress,
  updateCustomerMe,
} from "@/services/customer-auth";
import type {
  Customer,
  CustomerAddress,
  CustomerOrder,
} from "@/types/customer";

type CustomerAuthContextValue = {
  customer: Customer | null;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  updateProfile: (input: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => Promise<void>;
  addAddress: (input: Omit<CustomerAddress, "id">) => Promise<void>;
  editAddress: (
    addressId: string,
    input: Partial<Omit<CustomerAddress, "id">>,
  ) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getStoredCustomerToken();
    if (!token) {
      setCustomer(null);
      setOrders([]);
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const me = await getCustomerMe(token);
      const customerOrders = await getCustomerOrders(token);
      const customerAddresses = await getCustomerAddresses(token);
      setCustomer(me);
      setOrders(customerOrders);
      setAddresses(customerAddresses);
    } catch {
      clearStoredCustomerToken();
      setCustomer(null);
      setOrders([]);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }) => {
      setIsLoading(true);
      try {
        await registerCustomer(input);
        await refreshProfile();
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProfile],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        await loginCustomer(email, password);
        await refreshProfile();
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProfile],
  );

  const updateProfile = useCallback(
    async (input: { first_name?: string; last_name?: string; phone?: string }) => {
      const token = getStoredCustomerToken();
      if (!token) throw new Error("No active session.");
      await updateCustomerMe(token, input);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const addAddress = useCallback(
    async (input: Omit<CustomerAddress, "id">) => {
      const token = getStoredCustomerToken();
      if (!token) throw new Error("No active session.");
      await createCustomerAddress(token, input);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const editAddress = useCallback(
    async (addressId: string, input: Partial<Omit<CustomerAddress, "id">>) => {
      const token = getStoredCustomerToken();
      if (!token) throw new Error("No active session.");
      await updateCustomerAddress(token, addressId, input);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const removeAddress = useCallback(
    async (addressId: string) => {
      const token = getStoredCustomerToken();
      if (!token) throw new Error("No active session.");
      await deleteCustomerAddress(token, addressId);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const logout = useCallback(() => {
    clearStoredCustomerToken();
    setCustomer(null);
    setOrders([]);
    setAddresses([]);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      orders,
      addresses,
      isLoading,
      isAuthenticated: Boolean(customer),
      register,
      login,
      updateProfile,
      addAddress,
      editAddress,
      removeAddress,
      logout,
      refreshProfile,
    }),
    [
      customer,
      orders,
      addresses,
      isLoading,
      register,
      login,
      updateProfile,
      addAddress,
      editAddress,
      removeAddress,
      logout,
      refreshProfile,
    ],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}
