import { useLocation } from "@/contexts/LocationContext";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

const CurrencyDisplay = ({ amount, className = "" }: CurrencyDisplayProps) => {
  const { convertPrice } = useLocation();
  const { amount: convertedAmount, symbol } = convertPrice(amount);

  return (
    <span className={className}>
      {symbol}
      {convertedAmount.toFixed(2)}
    </span>
  );
};

export default CurrencyDisplay;
