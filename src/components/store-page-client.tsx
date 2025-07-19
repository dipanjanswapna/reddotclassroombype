

'use client';

import { useState, useMemo } from 'react';
import { Product, StoreCategory } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Filter, X, Search, Book, Pen, Shirt } from 'lucide-react';
import { ProductCard } from './product-card';

const categoryIcons: { [key: string]: React.ReactNode } = {
  'T-Shirt': <Shirt className="h-4 w-4" />,
  'Hoodie': <Shirt className="h-4 w-4" />,
  'Jersey': <Shirt className="h-4 w-4" />,
  'Apparel': <Shirt className="h-4 w-4" />,
  'PDF Book': <Book className="h-4 w-4" />,
  'Printed Book': <Book className="h-4 w-4" />,
  'E-Book': <Book className="h-4 w-4" />,
  'Pen': <Pen className="h-4 w-4" />,
  'Notebook': <Book className="h-4 w-4" />,
  'Stationery': <Pen className="h-4 w-4" />,
};

const FilterSidebar = ({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
  stockStatus,
  onStockChange,
  clearFilters,
}: {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
  stockStatus: 'all' | 'in-stock';
  onStockChange: (status: 'all' | 'in-stock') => void;
  clearFilters: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryChange(category)}
              />
              <Label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                 {categoryIcons[category] || <Book className="h-4 w-4" />} {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={[0, 1000]}
          max={2000}
          step={50}
          value={priceRange}
          onValueChange={onPriceChange}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>৳{priceRange[0]}</span>
          <span>৳{priceRange[1]}</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Availability</h3>
        <div className="flex items-center space-x-2">
            <Checkbox
                id="in-stock"
                checked={stockStatus === 'in-stock'}
                onCheckedChange={(checked) => onStockChange(checked ? 'in-stock' : 'all')}
            />
            <Label htmlFor="in-stock">In Stock</Label>
        </div>
      </div>
      <Button variant="ghost" onClick={clearFilters} className="w-full">
        <X className="mr-2 h-4 w-4" /> Clear All Filters
      </Button>
    </div>
  );
};

export function StorePageClient({ initialProducts, allCategories }: { initialProducts: Product[], allCategories: StoreCategory[] }) {
    const [products] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
    const [stockStatus, setStockStatus] = useState<'all' | 'in-stock'>('all');

    const categories = useMemo(() => allCategories.sort((a,b) => (a.order || 99) - (b.order || 99)).map(c => c.name), [allCategories]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            const matchesStock = stockStatus === 'all' || (product.stock && product.stock > 0);
            return matchesSearch && matchesCategory && matchesPrice && matchesStock;
        });
    }, [products, searchTerm, selectedCategories, priceRange, stockStatus]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, 2000]);
        setStockStatus('all');
        setSearchTerm('');
    };

    return (
        <div className="container mx-auto px-4 grid lg:grid-cols-4 gap-8 py-8">
            <aside className="hidden lg:block lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                    <CardContent>
                        <FilterSidebar
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onCategoryChange={handleCategoryChange}
                            priceRange={priceRange}
                            onPriceChange={setPriceRange}
                            stockStatus={stockStatus}
                            onStockChange={setStockStatus}
                            clearFilters={clearFilters}
                        />
                    </CardContent>
                </Card>
            </aside>
            <main className="lg:col-span-3">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline"><Filter className="mr-2 h-4 w-4"/> Filters</Button>
                            </SheetTrigger>
                            <SheetContent>
                                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                                <FilterSidebar
                                    categories={categories}
                                    selectedCategories={selectedCategories}
                                    onCategoryChange={handleCategoryChange}
                                    priceRange={priceRange}
                                    onPriceChange={setPriceRange}
                                    stockStatus={stockStatus}
                                    onStockChange={setStockStatus}
                                    clearFilters={clearFilters}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <p className="text-muted-foreground">No products found matching your criteria.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
