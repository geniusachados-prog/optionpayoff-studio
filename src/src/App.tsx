import './App.css'

// Lemon Squeezy Checkout Configuration
const CHECKOUT_LINK = 'https://optionpayoffstudio.lemonsqueezy.com/checkout/buy/28e58903-db2f-4873-aa0e-ccdd0bb82f2f';

function App() {
  return (
      <div className="app-container">
            <header className="app-header">
                    <h1>OptionPayoff Studio</h1>
                            <button onClick={() => window.open(CHECKOUT_LINK, '_blank')} className="upgrade-button" >
                                      Upgrade to Pro - $9/mês
                                              </button>
                                                    </header>

                                                          <main className="app-main">
                                                                  <p>Options Strategy Payoff Visualizer</p>
                                                                          <p style={{fontSize: '14px', color: '#666'}}>Coming soon...</p>
                                                                                </main>
                                                                                    </div>
                                                                                      )
                                                                                      }

                                                                                      export default App