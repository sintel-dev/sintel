import numpy as np
import pandas as pd
from mtv.utils import get_files

# test pandas & numpy
# a = np.array([1,5,7])
# b = np.array([[11], [111], [1111]])

# df = pd.DataFrame(data=b, index=a)
# print(df.loc[1:5].mean(axis=0, skipna=True)[0])

# print nasa data filename
files = get_files('/Users/dyu/Downloads/data/train')
ss = ''
for fl in files:
    ss += "'{}', ".format(fl[:-4])

print(ss)

