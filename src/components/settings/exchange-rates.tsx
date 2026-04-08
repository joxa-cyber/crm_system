"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshExchangeRates } from "@/actions/settings";
import { toast } from "sonner";

interface ExchangeRatesProps {
  rates: { currency: string; rate: string }[];
}

export function ExchangeRates({ rates }: ExchangeRatesProps) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    const result = await refreshExchangeRates();
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Valyuta kurslari yangilandi");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Valyuta kurslari (CBU)</CardTitle>
          <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
            {loading ? "Yangilanmoqda..." : "Yangilash"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rates.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Hali kurslar yuklanmagan. &quot;Yangilash&quot; tugmasini bosing.
          </p>
        ) : (
          <div className="space-y-2">
            {rates.map((r) => (
              <div key={r.currency} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">1 {r.currency}</span>
                <span className="font-medium">
                  {Number(r.rate).toLocaleString("uz-UZ")} so'm
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
