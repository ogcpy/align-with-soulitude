import React from 'react';
import { useCurrency, currencies } from '../hooks/useCurrency';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Check, ChevronsUpDown, Coins } from 'lucide-react';

export default function CurrencySelector() {
  const { activeCurrency, changeCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto h-8 gap-1 text-xs"
        >
          <Coins className="h-3.5 w-3.5" />
          <span>{activeCurrency.code}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {Object.values(currencies).map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => changeCurrency(currency.code)}
            className="cursor-pointer justify-between"
          >
            <span>
              {currency.symbol} {currency.code}
            </span>
            {currency.code === activeCurrency.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}