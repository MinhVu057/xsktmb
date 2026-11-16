# XSKT MB

**Summary**: `xskt.py` is a simple python code for Xo So Kien Thiet Mien Bac (XSKT MB). Now I want to convert it into a website and deploy and GitHub page.

**Winning Numbers (Lottery Winning Numbers)**: The `generator_number()` function will generate winning numbers (with leading zeros), including 5-digit numbers (for special, first, second, and third prizes), 4-digit numbers (for fourth and fifth prizes), 3-digit numbers (for 6th prizes), and 2-digit numbers (for 7th prizes). The numbers should be unique for each i-digit numbers (the current code hasn't considered that yet). In the website, print the numbers with the format as in `image.png`, but use English (e.g., "DB" changes to "Special", "Giai 1" to "First" or "First Prize"), and simplify it (just show the table only, do not need to add texts around). I have `split` to show how many numbers for each prizes, such as 1 number for Special, 1 for First, 2 for Second, etc.

**Prizes**: The user will choose a 5-digit number (with leading zeros) for a ticket, and type in the `price` to purchase that ticket (10K VND minimum). Here is how the prize works (have been specified in `rules` in the code):
1. Special: price * 20000
2. First: price * 2000
3. Second: price * 500
4. Third: price * 200
5. 4th: price * 40
6. 5th: price * 20
7. 6th: price * 10
8. 7th: price * 4

**Rule to check**: `check_ticket()` in the code

**Requirements for the website**:
1. Simple website, light theme. Keep the title/name `XSKT MB`. Keep the website easy to navigate and use, lightweight. 
2. Have separate navigations, such as Play, Rules, and Account (showing `bank_money`, current `limit`, and deposit (`add_money()`))
3. If external libraries needed, first create virtual env (named `venv`), and add the libraries needed. 
4. You can keep the original `xskt.py` and create another script(s) for the website if that's easier. Otherwise, you can directly modify on that script. 




