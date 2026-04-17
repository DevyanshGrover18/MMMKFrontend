import { useQuery } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { getAllCategory } from '../apis/nonAuth/category';
import { getAllProductsWithFilters } from '../apis/nonAuth/products';

const GlobalContext = createContext(null);

const GlobalProvider = ({ children }) => {
  const [utils, setUtils] = useState({
    screenSizeFactor: 3,
    categories: [],
    recommendedProducts: [],
    randomProducts: [],
  });
  const updateUtils = (newUtils) => {
    setUtils((prev) => ({ ...prev, ...newUtils }));
  };

  // Tracks the drag-and-drop order of category IDs separately from server data
  const [categoryOrder, setCategoryOrder] = useState(null);

  const { pathname } = window.location;

  const screenSizes = useMemo(
    () =>
      Object.values(screenSizeFactors)
        .map((item) => item.maxWidth)
        .sort((a, b) => a - b),
    []
  );

  const handleResizeWindow = (e) => {
    const innerWidth = e?.target?.width || window.innerWidth;
    const newScreenSizeFactor =
      screenSizes.findIndex((item) => innerWidth < item) + 1;
    if (utils.screenSizeFactor !== newScreenSizeFactor)
      updateUtils({ screenSizeFactor: newScreenSizeFactor });
  };

  const Categories = useQuery({
    queryKey: ['getAllCategory'],
    queryFn: getAllCategory,
  });

  const recommendedProducts = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProductsWithFilters({ showOnHomepage: true }),
    enabled: pathname === '/',
  });

  // When server data arrives, initialise order (only if not already set by user drag)
  useEffect(() => {
    const serverCategories = Categories.data?.data || [];
    if (serverCategories.length > 0) {
      setCategoryOrder((prev) => {
        // If user has already reordered, preserve their order;
        // just append any new IDs from the server at the end.
        if (prev && prev.length > 0) {
          const existingIds = new Set(prev);
          const newIds = serverCategories
            .map((c) => c._id)
            .filter((id) => !existingIds.has(id));
          return newIds.length > 0 ? [...prev, ...newIds] : prev;
        }
        // First load — use server order as-is
        return serverCategories.map((c) => c._id);
      });
    }
    updateUtils({ recommendedProducts: recommendedProducts.data?.data || [] });
  }, [Categories.data, recommendedProducts.data]);

  // Derive the ordered categories array from categoryOrder + server data
  const orderedCategories = useMemo(() => {
    const serverCategories = Categories.data?.data || [];
    if (!categoryOrder || categoryOrder.length === 0) return serverCategories;
    const map = Object.fromEntries(serverCategories.map((c) => [c._id, c]));
    return categoryOrder.map((id) => map[id]).filter(Boolean);
  }, [categoryOrder, Categories.data]);

  // Keep utils.categories in sync with orderedCategories
  useEffect(() => {
    updateUtils({ categories: orderedCategories });
  }, [orderedCategories]);

  /**
   * Call this from CategoryPage after a drag-end event.
   * Accepts the new ordered array of category objects OR just their IDs.
   *
   * Usage (with dnd-kit arrayMove result):
   *   reorderCategories(newOrderedArray)          // pass full objects
   *   reorderCategories(newOrderedArray, true)    // pass IDs only
   */
  const reorderCategories = (newOrder, idsOnly = false) => {
    if (idsOnly) {
      setCategoryOrder(newOrder);
    } else {
      setCategoryOrder(newOrder.map((c) => c._id));
    }
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResizeWindow);
    return () => window.removeEventListener('resize', handleResizeWindow);
  }, [utils.screenSizeFactor]);

  useLayoutEffect(() => {
    handleResizeWindow();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        ...utils,
        updateGlobalContext: updateUtils,
        reorderCategories,
        categoryOrder,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export { useGlobalContext, GlobalProvider };

const screenSizeFactors = {
  1: { name: 'extra small mobile', minWidth: 0, maxWidth: 320 },
  2: { name: 'small mobile', minWidth: 321, maxWidth: 480 },
  3: { name: 'mobile', minWidth: 481, maxWidth: 640 },
  4: { name: 'small tablet', minWidth: 641, maxWidth: 768 },
  5: { name: 'tablet', minWidth: 769, maxWidth: 1024 },
  6: { name: 'small laptop', minWidth: 1025, maxWidth: 1280 },
  7: { name: 'desktop', minWidth: 1281, maxWidth: 1536 },
  8: { name: 'large desktop', minWidth: 1537, maxWidth: 1920 },
  9: { name: 'ultra wide', minWidth: 1921, maxWidth: 1000000 },
};
