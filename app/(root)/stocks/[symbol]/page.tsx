import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

const StockDetails = async ({ params }: StockDetailsPageProps) => {
  const { symbol } = await params;
  const upper = symbol?.toUpperCase?.() ?? "";

  const base = "https://s3.tradingview.com/external-embedding/embed-widget-";

  return (
    <div className="flex min-h-screen">
      <section className="grid w-full gap-8 grid-cols-1 md:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          <TradingViewWidget
            scriptUrl={`${base}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(upper)}
            height={170}
          />

          <TradingViewWidget
            title="Candlestick Chart"
            scriptUrl={`${base}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(upper)}
            height={600}
          />

          <TradingViewWidget
            title="Baseline Chart"
            scriptUrl={`${base}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(upper)}
            height={600}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-8">
          <div>
            <WatchlistButton
              symbol={upper}
              company={upper}
              isInWatchlist={false}
              type="button"
            />
          </div>

          <TradingViewWidget
            title="Technical Analysis"
            scriptUrl={`${base}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upper)}
            height={400}
          />

          <TradingViewWidget
            title="Company Profile"
            scriptUrl={`${base}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(upper)}
            height={440}
          />

          <TradingViewWidget
            title="Company Financials"
            scriptUrl={`${base}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(upper)}
            height={464}
          />
        </div>
      </section>
    </div>
  );
};

export default StockDetails;
