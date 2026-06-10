import { useState, useMemo } from 'react';

import './App.css';

// Lemon Squeezy Checkout Configuration

const CHECKOUT_LINK = 'https://optionpayoffstudio.lemonsqueezy.com/checkout/buy/28e58903-db2f-4873-aa0e-ccdd0bb82f2f';

// Free strategies (3 allowed)

const FREE_STRATEGIES = ['Iron Condor', 'Covered Call', 'Cash-Secured Put'];

// All available strategies

const ALL_STRATEGIES = [

    'Iron Condor',

    'Covered Call',

    'Cash-Secured Put',

    'Long Call',

    'Long Put',

    'Bull Call Spread',

    'Bear Put Spread',

    'Strangle',

    'Straddle',

    'Collar',

  ];

interface Inputs {

  spotPrice: number;

  strikePrice: number;

  premium: number;

  expirationDays: number;

}

interface StrategyInputs {

  [key: string]: {

      [key: string]: number;

  };

}

function App() {

  const [selectedStrategy, setSelectedStrategy] = useState<string>('Iron Condor');

  const [isPro, setIsPro] = useState<boolean>(false);

  const [inputs, setInputs] = useState<StrategyInputs>({

                                                           'Iron Condor': { spotPrice: 100, sellStrike: 105, buyStrike: 110, premium: 2 },

        'Covered Call': { spotPrice: 100, strikePrice: 105, premium: 3 },

        'Cash-Secured Put': { spotPrice: 100, strikePrice: 95, premium: 2.5 },

        'Long Call': { spotPrice: 100, strikePrice: 105, premium: 3 },

        'Long Put': { spotPrice: 100, strikePrice: 95, premium: 2 },

        'Bull Call Spread': { spotPrice: 100, longStrike: 100, shortStrike: 105, premium: 1.5 },

        'Bear Put Spread': { spotPrice: 100, longStrike: 95, shortStrike: 100, premium: 1 },

        'Strangle': { spotPrice: 100, callStrike: 105, putStrike: 95, premium: 2.5 },

        'Straddle': { spotPrice: 100, strikePrice: 100, premium: 4 },

        'Collar': { spotPrice: 100, callStrike: 105, putStrike: 95, callPremium: 1, putCost: 2 },

  });

  const isStrategyFree = FREE_STRATEGIES.includes(selectedStrategy);

  const isLocked = !isStrategyFree && !isPro;

  const calculatePayoff = () => {

        const strategyInputs = inputs[selectedStrategy] || {};

        const priceRange = Array.from({ length: 101 }, (_, i) => 50 + i);

        const payoffs = priceRange.map(price => {

                                             let payoff = 0;

                                             switch (selectedStrategy) {

                                               case 'Iron Condor': {

                                                           const { spotPrice = 100, sellStrike = 105, buyStrike = 110, premium = 2 } = strategyInputs;

                                                           const longCall = Math.max(price - buyStrike, 0);

                                                           const shortCall = Math.max(price - sellStrike, 0);

                                                           const longPut = Math.max(95 - price, 0);

                                                           const shortPut = Math.max(100 - price, 0);

                                                           payoff = premium + shortCall - longCall + shortPut - longPut;

                                                           break;

                                               }

                                               case 'Covered Call': {

                                                           const { spotPrice = 100, strikePrice = 105, premium = 3 } = strategyInputs;

                                                           const stockPayoff = price - spotPrice;

                                                           const callPayoff = Math.min(premium, Math.max(price - strikePrice, 0)) - premium;

                                                           payoff = stockPayoff + callPayoff;

                                                           break;

                                               }

                                               case 'Cash-Secured Put': {

                                                           const { spotPrice = 100, strikePrice = 95, premium = 2.5 } = strategyInputs;

                                                           const putPayoff = Math.max(strikePrice - price, 0) - premium;

                                                           payoff = putPayoff;

                                                           break;

                                               }

                                               case 'Long Call': {

                                                           const { strikePrice = 105, premium = 3 } = strategyInputs;

                                                           payoff = Math.max(price - strikePrice, 0) - premium;

                                                           break;

                                               }

                                               case 'Long Put': {

                                                           const { strikePrice = 95, premium = 2 } = strategyInputs;

                                                           payoff = Math.max(strikePrice - price, 0) - premium;

                                                           break;

                                               }

                                               case 'Bull Call Spread': {

                                                           const { longStrike = 100, shortStrike = 105, premium = 1.5 } = strategyInputs;

                                                           const longCall = Math.max(price - longStrike, 0);

                                                           const shortCall = Math.max(price - shortStrike, 0);

                                                           payoff = longCall - shortCall - premium;

                                                           break;

                                               }

                                               case 'Bear Put Spread': {

                                                           const { longStrike = 95, shortStrike = 100, premium = 1 } = strategyInputs;

                                                           const longPut = Math.max(longStrike - price, 0);

                                                           const shortPut = Math.max(shortStrike - price, 0);

                                                           payoff = shortPut - longPut + premium;

                                                           break;

                                               }

                                               case 'Strangle': {

                                                           const { callStrike = 105, putStrike = 95, premium = 2.5 } = strategyInputs;

                                                           const call = Math.max(price - callStrike, 0);

                                                           const put = Math.max(putStrike - price, 0);

                                                           payoff = call + put - premium;

                                                           break;

                                               }

                                               case 'Straddle': {

                                                           const { strikePrice = 100, premium = 4 } = strategyInputs;

                                                           const call = Math.max(price - strikePrice, 0);

                                                           const put = Math.max(strikePrice - price, 0);

                                                           payoff = call + put - premium;

                                                           break;

                                               }

                                               case 'Collar': {

                                                           const { callStrike = 105, putStrike = 95, callPremium = 1, putCost = 2 } = strategyInputs;

                                                           const stockPayoff = price - 100;

                                                           const callPayoff = Math.min(0, price - callStrike);

                                                           const putPayoff = Math.max(0, putStrike - price);

                                                           payoff = stockPayoff + callPayoff + putPayoff - callPremium + putCost;

                                                           break;

                                               }

                                               default:

                    payoff = 0;

                                             }

                                             return { price, payoff };

        });

        return payoffs;

  };

  const payoffData = useMemo(() => calculatePayoff(), [selectedStrategy, inputs]);

  const handleInputChange = (field: string, value: number) => {

        setInputs(prev => ({

                                 ...prev,

                [selectedStrategy]: {

                  ...prev[selectedStrategy],

                          [field]: value,

                },

        }));

  };

  const maxPayoff = Math.max(...payoffData.map(d => d.payoff));

  const minPayoff = Math.min(...payoffData.map(d => d.payoff));

  return (

        <div className="app-container">
        
          {/* Header */}
        
              <header className="app-header">
              
                      <div className="header-content">
                      
                                <h1>OptionPayoff Studio</h1>h1>
                      
                                <p className="subtitle">Interactive Options Strategy Visualizer</p>p>
                      
                      </div>div>
              
                      <button
                        
                                  onClick={() => window.open(CHECKOUT_LINK, '_blank')}
                        
                        className="upgrade-button"
                        
                      >
                      
                                🚀 Upgrade to Pro - $9/mês
                      
                      </button>button>
              
              </header>header>
        
          {/* Main Content */}
        
              <main className="app-main">
              
                      <div className="container">
                      
                        {/* Strategy Selector */}
                      
                                <section className="strategy-section">
                                
                                            <h2>Select Strategy</h2>h2>
                                
                                            <div className="strategy-grid">
                                            
                                              {ALL_STRATEGIES.map(strategy => {
          
                          const isFree = FREE_STRATEGIES.includes(strategy);
          
                          const isSelected = selectedStrategy === strategy;
          
                          
          
                          return (
                            
                                              <button
                                                
                                                                    key={strategy}
                                                
                                                                  className={`strategy-card ${isSelected ? 'active' : ''} ${!isFree && !isPro ? 'locked' : ''}`}
                                                
                                                                  onClick={() => {
                                                                    
                                                                                          if (isFree || isPro) {
                                                                                            
                                                                                                                    setSelectedStrategy(strategy);
                                                                                            
                                                                                            }
                                                                    
                                                                  }}
                                                
                                                                  disabled={!isFree && !isPro}
                                                
                                                                >
                                              
                                                                  <span className="strategy-name">{strategy}</span>span>
                                              
                                                {!isFree && !isPro && <span className="lock-icon">🔒</span>span>}
                                              
                                                {isFree && <span className="free-badge">FREE</span>span>}
                                              
                                              </button>button>
                            
                                            );
                                            
        })}
                                            
                                            </div>div>
                                
                                </section>section>
                      
                        {/* Locked Strategy Prompt */}
                      
                        {isLocked && (
          
                      <div className="upgrade-prompt">
                      
                                    <div className="upgrade-content">
                                    
                                                    <h3>🔒 Pro Feature Locked</h3>h3>
                                    
                                                    <p>Unlock "{selectedStrategy}" and 7 more professional strategies with Pro.</p>p>
                                    
                                                    <button
                                                      
                                                                        onClick={() => window.open(CHECKOUT_LINK, '_blank')}
                                                      
                                                      className="upgrade-button-large"
                                                      
                                                    >
                                                    
                                                                      Upgrade Now - Only $9/mês
                                                    
                                                    </button>button>
                                    
                                    </div>div>
                      
                      </div>div>
                      
                    )}
                      
                        {/* Strategy Inputs */}
                      
                        {!isLocked && (
          
                      <section className="inputs-section">
                      
                                    <h2>Strategy Parameters</h2>h2>
                      
                                    <div className="inputs-grid">
                                    
                                      {selectedStrategy === 'Iron Condor' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Spot Price</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.spotPrice || 100}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('spotPrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Sell Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.sellStrike || 105}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('sellStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Buy Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.buyStrike || 110}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('buyStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Premium Received</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 2}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Covered Call' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Stock Price</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.spotPrice || 100}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('spotPrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.strikePrice || 105}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Call Premium</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 3}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Cash-Secured Put' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Current Price</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.spotPrice || 100}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('spotPrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Put Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.strikePrice || 95}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Put Premium</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 2.5}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Long Call' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Strike Price</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.strikePrice || 105}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Premium Paid</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 3}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Long Put' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Strike Price</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.strikePrice || 95}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Premium Paid</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 2}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Bull Call Spread' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Long Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.longStrike || 100}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('longStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Short Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.shortStrike || 105}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('shortStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Net Premium</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 1.5}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Bear Put Spread' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Long Put Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.longStrike || 95}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('longStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Short Put Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.shortStrike || 100}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('shortStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Net Credit</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 1}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Strangle' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.callStrike || 105}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('callStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Put Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.putStrike || 95}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('putStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Total Premium</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 2.5}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Straddle' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Strike Price</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.strikePrice || 100}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('strikePrice', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Total Premium</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      step="0.1"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.premium || 4}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('premium', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                      {selectedStrategy === 'Collar' && (
                        
                                          <>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Call Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.callStrike || 105}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('callStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                                              <div className="input-group">
                                                              
                                                                                    <label>Put Strike</label>label>
                                                              
                                                                                    <input
                                                                                      
                                                                                                              type="number"
                                                                                      
                                                                                      value={inputs[selectedStrategy]?.putStrike || 95}
                                                                                      
                                                                                      onChange={(e) => handleInputChange('putStrike', parseFloat(e.target.value))}
                                                                                      
                                                                                    />
                                                              
                                                              </div>div>
                                          
                                          </>>
                        
                                        )}
                                    
                                    </div>div>
                      
                      </section>section>
                      
                    )}
                      
                        {/* Payoff Chart */}
                      
                        {!isLocked && (
          
                      <section className="chart-section">
                      
                                    <h2>Payoff Diagram</h2>h2>
                      
                                    <div className="chart-container">
                                    
                                                    <svg viewBox="0 0 800 400" className="payoff-chart">
                                                    
                                                      {/* Grid */}
                                                    
                                                      {Array.from({ length: 11 }, (_, i) => (
                        
                                            <line
                                              
                                                                    key={`grid-h-${i}`}
                                              
                                                                    x1="50"
                                              
                                                                    y1={40 + i * 32}
                                              
                                                                    x2="750"
                                              
                                                                    y2={40 + i * 32}
                                              
                                                                    stroke="#e0e0e0"
                                              
                                                                    strokeWidth="1"
                                              
                                                                  />
                        
                                          ))}
                                                    
                                                      {Array.from({ length: 11 }, (_, i) => (
                        
                                            <line
                                              
                                                                    key={`grid-v-${i}`}
                                              
                                                                    x1={50 + i * 70}
                                              
                                                                    y1="40"
                                              
                                                                    x2={50 + i * 70}
                                              
                                                                    y2="360"
                                              
                                                                    stroke="#e0e0e0"
                                              
                                                                    strokeWidth="1"
                                              
                                                                  />
                        
                                          ))}
                                                    
                                                      {/* Axes */}
                                                    
                                                                      <line x1="50" y1="360" x2="750" y2="360" stroke="#333" strokeWidth="2" />
                                                    
                                                                      <line x1="50" y1="40" x2="50" y2="360" stroke="#333" strokeWidth="2" />
                                                    
                                                      {/* Zero line */}
                                                    
                                                                      <line
                                                                        
                                                                                            x1="50"
                                                                        
                                                                        y1={360 - ((0 - minPayoff) / (maxPayoff - minPayoff)) * 320}
                                                                        
                                                                        x2="750"
                                                                        
                                                                        y2={360 - ((0 - minPayoff) / (maxPayoff - minPayoff)) * 320}
                                                                        
                                                                        stroke="#ff0000"
                                                                        
                                                                        strokeWidth="1"
                                                                        
                                                                        strokeDasharray="5,5"
                                                                        
                                                                      />
                                                    
                                                      {/* Payoff line */}
                                                    
                                                                      <polyline
                                                                        
                                                                                            points={payoffData
                                                                                              
                                                                                                                    .map((d, i) => {
                                                                                                                      
                                                                                                                                              const x = 50 + (i / 100) * 700;
                                                                                                                      
                                                                                                                                              const y = 360 - ((d.payoff - minPayoff) / (maxPayoff - minPayoff)) * 320;
                                                                                                                      
                                                                                                                                              return `${x},${y}`;
                                                                                                                      
                                                                                                                      })
                                                                                              
                                                                                                                    .join(' ')}
                                                                        
                                                                        fill="none"
                                                                        
                                                                        stroke="#6366f1"
                                                                        
                                                                        strokeWidth="3"
                                                                        
                                                                      />
                                                    
                                                      {/* Labels */}
                                                    
                                                                      <text x="400" y="390" textAnchor="middle" fontSize="12" fill="#666">
                                                                      
                                                                                          Underlying Price ($)
                                                                      
                                                                      </text>text>
                                                    
                                                                      <text x="20" y="200" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(-90 20 200)">
                                                                      
                                                                                          Profit/Loss ($)
                                                                      
                                                                      </text>text>
                                                    
                                                    </svg>svg>
                                    
                                    </div>div>
                      
                                    <div className="chart-stats">
                                    
                                                    <div className="stat">
                                                    
                                                                      <span>Max Profit:</span>span>
                                                    
                                                                      <strong>${maxPayoff.toFixed(2)}</strong>strong>
                                                    
                                                    </div>div>
                                    
                                                    <div className="stat">
                                                    
                                                                      <span>Max Loss:</span>span>
                                                    
                                                                      <strong>${minPayoff.toFixed(2)}</strong>strong>
                                                    
                                                    </div>div>
                                    
                                    </div>div>
                      
                      </section>section>
                      
                    )}
                      
                      </div>div>
              
              </main>main>
        
          {/* Footer */}
        
              <footer className="app-footer">
              
                      <p>OptionPayoff Studio • Options Strategy Visualizer</p>p>
              
                      <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      
                                Free strategies: Iron Condor, Covered Call, Cash-Secured Put • Upgrade to unlock 7 more
                      
                      </p>p>
              
              </footer>footer>
        
        </div>div>
    
      );
  
}

export default App;</></></></></></></></></></></div>
