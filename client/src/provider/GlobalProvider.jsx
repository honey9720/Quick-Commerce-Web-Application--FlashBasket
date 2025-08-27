
import { createContext, useContext, useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch, useSelector } from "react-redux";
import { handleAddItemCart } from "../store/cartProduct";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { handleAddAddress } from "../store/addressSlice";
import { setOrder } from "../store/orderSlice";

export const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [products, setProducts] = useState([]); // <-- added products state
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state?.user);

  const fetchCartItem = async () => {
    try {
      const response = await Axios({ ...SummaryApi.getCartItem });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateCartItem = async (id, qty) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: { _id: id, qty },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        fetchCartItem();
        return responseData;
      }
    } catch (error) {
      AxiosToastError(error);
      return error;
    }
  };

  const deleteCartItem = async (cartId) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: { _id: cartId },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleLogoutOut = () => {
    localStorage.clear();
    dispatch(handleAddItemCart([]));
  };

  const fetchAddress = async () => {
    try {
      const response = await Axios({ ...SummaryApi.getAddress });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
      }
    } catch (error) {}
  };

  const fetchOrder = async () => {
    try {
      const response = await Axios({ ...SummaryApi.getOrderItems });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setOrder(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------- Fetch products by category/subcategory ----------------
  const fetchProductsByCategory = async (categoryId, subCategoryId, page = 1, limit = 10) => {
    if (!categoryId || !subCategoryId) return;

    try {
      const response = await Axios({
        method: "POST",
        url: "/api/product/get-pruduct-by-category-and-subcategory",
        data: { categoryId, subCategoryId, page, limit },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setProducts(responseData.data);
      } else {
        setProducts([]);
        console.error("Products fetch error:", responseData.message);
      }
    } catch (error) {
      AxiosToastError(error);
      setProducts([]);
    }
  };

  // ---------------- Calculate totals ----------------
  useEffect(() => {
    const qty = cartItem.reduce((prev, curr) => prev + curr.quantity, 0);
    setTotalQty(qty);

    const tPrice = cartItem.reduce((prev, curr) => {
      const priceAfterDiscount = pricewithDiscount(curr?.productId?.price, curr?.productId?.discount);
      return prev + priceAfterDiscount * curr.quantity;
    }, 0);
    setTotalPrice(tPrice);

    const notDiscountPrice = cartItem.reduce((prev, curr) => prev + curr?.productId?.price * curr.quantity, 0);
    setNotDiscountTotalPrice(notDiscountPrice);
  }, [cartItem]);

  useEffect(() => {
    fetchCartItem();
    handleLogoutOut();
    fetchAddress();
    fetchOrder();
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
        fetchCartItem,
        updateCartItem,
        deleteCartItem,
        fetchAddress,
        fetchOrder,
        totalPrice,
        totalQty,
        notDiscountTotalPrice,
        fetchProductsByCategory, // <-- expose product fetch
        products,               // <-- expose products state
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
