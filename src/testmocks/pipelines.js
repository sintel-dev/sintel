export const pipelines = [
    {
        "id": "5da7cc308c5ceceb9f28901c",
        "insert_time": "2019-10-17T02:04:32.151000",
        "name": "lstm",
        "created_by": null,
        "mlpipeline": {
            "primitives": [
                "mlprimitives.custom.timeseries_preprocessing.time_segments_average",
                "sklearn.impute.SimpleImputer",
                "sklearn.preprocessing.MinMaxScaler",
                "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences",
                "keras.Sequential.LSTMTimeSeriesRegressor",
                "mlprimitives.custom.timeseries_anomalies.regression_errors",
                "mlprimitives.custom.timeseries_anomalies.find_anomalies"
            ],
            "init_params": {
                "mlprimitives.custom.timeseries_preprocessing.time_segments_average#1": {
                    "time_column": "timestamp",
                    "interval": 21600
                },
                "sklearn.preprocessing.MinMaxScaler#1": {
                    "feature_range": [
                        -1,
                        1
                    ]
                },
                "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1": {
                    "target_column": 0,
                    "window_size": 250
                },
                "keras.Sequential.LSTMTimeSeriesRegressor": {
                    "epochs": 35,
                    "verbose": false,
                    "layers": [
                        {
                            "class": "keras.layers.CuDNNLSTM",
                            "parameters": {
                                "input_shape": "input_shape",
                                "units": "lstm_1_units",
                                "return_sequences": true
                            }
                        },
                        {
                            "class": "keras.layers.Dropout",
                            "parameters": {
                                "rate": "dropout_1_rate"
                            }
                        },
                        {
                            "class": "keras.layers.CuDNNLSTM",
                            "parameters": {
                                "units": "lstm_2_units",
                                "return_sequences": false
                            }
                        },
                        {
                            "class": "keras.layers.Dropout",
                            "parameters": {
                                "rate": "dropout_2_rate"
                            }
                        },
                        {
                            "class": "keras.layers.Dense",
                            "parameters": {
                                "units": "dense_units",
                                "activation": "linear"
                            }
                        }
                    ]
                }
            },
            "input_names": {
                "mlprimitives.custom.timeseries_anomalies.find_anomalies#1": {
                    "index": "target_index"
                }
            },
            "output_names": {
                "keras.Sequential.LSTMTimeSeriesRegressor#1": {
                    "y": "y_hat"
                }
            },
            "outputs": {
                "default": [
                    {
                        "name": "events",
                        "variable": "mlprimitives.custom.timeseries_anomalies.find_anomalies#1.y"
                    }
                ],
                "visualization": [
                    {
                        "name": "X_raw",
                        "variable": "sklearn.impute.SimpleImputer#1.X"
                    },
                    {
                        "name": "raw_index",
                        "variable": "mlprimitives.custom.timeseries_preprocessing.time_segments_average#1.index"
                    },
                    {
                        "name": "X_nm",
                        "variable": "sklearn.preprocessing.MinMaxScaler#1.X"
                    },
                    {
                        "name": "y",
                        "variable": "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1.y"
                    },
                    {
                        "name": "y_hat",
                        "variable": "keras.Sequential.LSTMTimeSeriesRegressor#1.y_hat"
                    },
                    {
                        "name": "es",
                        "variable": "mlprimitives.custom.timeseries_anomalies.regression_errors#1.errors"
                    },
                    {
                        "name": "target_index",
                        "variable": "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1.target_index"
                    }
                ]
            }
        }
    },
    {
        "id": "5da7cc308c5ceceb9f28901d",
        "insert_time": "2019-10-17T02:04:32.200000",
        "name": "cyclegan",
        "created_by": null,
        "mlpipeline": {
            "primitives": [
                "mlprimitives.custom.timeseries_preprocessing.time_segments_aggregate",
                "sklearn.impute.SimpleImputer",
                "sklearn.preprocessing.MinMaxScaler",
                "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences",
                "mlprimitives.candidates.timeseries.cyclegan.CycleGAN",
                "mlprimitives.candidates.timeseries.cyclegan.score_anomalies",
                "mlprimitives.custom.timeseries_anomalies.find_anomalies"
            ],
            "init_params": {
                "mlprimitives.custom.timeseries_preprocessing.time_segments_aggregate#1": {
                    "time_column": "timestamp",
                    "interval": 21600,
                    "method": "mean"
                },
                "sklearn.preprocessing.MinMaxScaler#1": {
                    "feature_range": [
                        -1,
                        1
                    ]
                },
                "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1": {
                    "target_column": 0,
                    "window_size": 100,
                    "target_size": 1
                },
                "mlprimitives.candidates.timeseries.cyclegan.CycleGAN#1": {
                    "epochs": 2000,
                    "layers_encoder": [
                        {
                            "class": "keras.layers.Bidirectional",
                            "parameters": {
                                "layer": {
                                    "class": "keras.layers.CuDNNLSTM",
                                    "parameters": {
                                        "units": 100,
                                        "return_sequences": true
                                    }
                                }
                            }
                        },
                        {
                            "class": "keras.layers.Flatten",
                            "parameters": {}
                        },
                        {
                            "class": "keras.layers.Dense",
                            "parameters": {
                                "units": 20
                            }
                        },
                        {
                            "class": "keras.layers.Reshape",
                            "parameters": {
                                "target_shape": "encoder_reshape_shape"
                            }
                        }
                    ],
                    "layers_generator": [
                        {
                            "class": "keras.layers.Flatten",
                            "parameters": {}
                        },
                        {
                            "class": "keras.layers.Dense",
                            "parameters": {
                                "units": 50
                            }
                        },
                        {
                            "class": "keras.layers.Reshape",
                            "parameters": {
                                "target_shape": "generator_reshape_shape"
                            }
                        },
                        {
                            "class": "keras.layers.Bidirectional",
                            "parameters": {
                                "layer": {
                                    "class": "keras.layers.CuDNNLSTM",
                                    "parameters": {
                                        "units": 64,
                                        "return_sequences": true
                                    }
                                },
                                "merge_mode": "concat"
                            }
                        },
                        {
                            "class": "keras.layers.convolutional.UpSampling1D",
                            "parameters": {
                                "size": 2
                            }
                        },
                        {
                            "class": "keras.layers.Bidirectional",
                            "parameters": {
                                "layer": {
                                    "class": "keras.layers.CuDNNLSTM",
                                    "parameters": {
                                        "units": 64,
                                        "return_sequences": true
                                    }
                                },
                                "merge_mode": "concat"
                            }
                        },
                        {
                            "class": "keras.layers.TimeDistributed",
                            "parameters": {
                                "layer": {
                                    "class": "keras.layers.Dense",
                                    "parameters": {
                                        "units": 1
                                    }
                                }
                            }
                        },
                        {
                            "class": "keras.layers.Activation",
                            "parameters": {
                                "activation": "tanh"
                            }
                        }
                    ]
                }
            },
            "input_names": {
                "mlprimitives.custom.timeseries_anomalies.find_anomalies#1": {
                    "index": "index"
                },
                "mlprimitives.candidates.timeseries.cyclegan.score_anomalies#1": {
                    "y": "X"
                }
            },
            "output_names": {
                "mlprimitives.candidates.timeseries.cyclegan.CycleGAN#1": {
                    "y": "y_hat"
                },
                "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1": {
                    "index": "X_index"
                }
            },
            "outputs": {
                "default": [
                    {
                        "name": "events",
                        "variable": "mlprimitives.custom.timeseries_anomalies.find_anomalies#1.y"
                    }
                ],
                "visualization": [
                    {
                        "name": "X_raw",
                        "variable": "sklearn.impute.SimpleImputer#1.X"
                    },
                    {
                        "name": "raw_index",
                        "variable": "mlprimitives.custom.timeseries_preprocessing.time_segments_aggregate#1.index"
                    },
                    {
                        "name": "X_nm",
                        "variable": "sklearn.preprocessing.MinMaxScaler#1.X"
                    },
                    {
                        "name": "y",
                        "variable": "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1.y"
                    },
                    {
                        "name": "y_hat",
                        "variable": "mlprimitives.candidates.timeseries.cyclegan.CycleGAN#1.y_hat"
                    },
                    {
                        "name": "es",
                        "variable": "mlprimitives.candidates.timeseries.cyclegan.score_anomalies#1.errors"
                    },
                    {
                        "name": "target_index",
                        "variable": "mlprimitives.custom.timeseries_preprocessing.rolling_window_sequences#1.target_index"
                    }
                ]
            }
        }
    }
]
