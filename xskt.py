# XSKT MB 
import random
from collections import defaultdict

bank_money = 1000000
limit = 500000
bought_tickets = []

rules = {5: [20000, 2000]+[500]*2+[200]*6, 4: [40]*4+[20]*6, 3: [10]*3, 2: [4]*4}
split = {5: [0,1,2,4,10], 4: [0,4,10], 3: [0, 3], 2: [0, 4]}


def check_balance():
    print(f"Your current balance is: {bank_money} VND")

def add_money(amount):
    global bank_money 
    global limit
    if amount > 0 and amount <= limit:
        bank_money += amount
        print(f"Successfully added {amount} VND to your account.")
    elif amount > limit:
        print(f"Cannot add more than {limit} VND at once.")
        extend = input("Do you want to extend the limit? (yes/no): ").strip().lower()
        if extend == 'yes':
            new_limit = int(input("Enter the new limit: "))
            limit = new_limit
            if amount <= new_limit:
                bank_money += amount
                print(f"Successfully added {amount} VND to your account.")
            else:
                print(f"Amount exceeds the new limit of {new_limit} VND. Transaction failed.")
        else:
            print("Transaction cancelled.")
    else:
        print("Please enter a positive amount to add.")

def generate_numbers():
    winning_numbers = defaultdict(list)
    for i in rules.keys():
        numbers = [f"{random.randint(0, int("9"*i)):0{i}d}" for _ in rules[i]]
        winning_numbers[i] = numbers
        s = f"{i}-digit numbers: "
        for j in range(len(split[i])-1):
            s += f"{numbers[split[i][j]:split[i][j+1]]} "
        print(s)   
    return winning_numbers

def check_ticket(ticket_number, winning_numbers, price):
    global bank_money
    check_any_win = 0
    for i in winning_numbers.keys():
        if ticket_number[-i:] in winning_numbers[i]:
            print(f"Congratulations! Your ticket {ticket_number} matches a {i}-digit winning number: {ticket_number[-i:]}")
            print(f"You have won x{rules[i][winning_numbers[i].index(ticket_number[-i:])]} price - Total: {rules[i][winning_numbers[i].index(ticket_number[-i:])]*price} VND")
            bank_money += rules[i][winning_numbers[i].index(ticket_number[-i:])]*price      
            check_any_win += 1
    if check_any_win == 0:
        print(f"Sorry, your ticket {ticket_number} did not win any prize this time.")


def main():
    global bank_money
    global limit
    global bought_tickets
    while True:
        print("\nWelcome to the XSKT MB Lottery System!")
        print("1. Buy lottery tickets and check today's numbers")
        print("2. Add Money")
        print("3. Check Balance")
        print("4. Check bought tickets")
        print("5. Exit")
        
        choice = input("Please select an option (1-5): ").strip()
        
        if choice == '3':
            check_balance()
        elif choice == '2':
            try:
                amount = int(input("Enter the amount to add: "))
                add_money(amount)
            except ValueError:
                print("Invalid input. Please enter numeric values.")
        elif choice == '1':
            number = input("Choose your numbers for the lottery ticket (5 digits): ")
            if not number:
                number = f"{random.randint(0, int("9"*5)):0{5}d}"
            price = input("Enter the price of the ticket (min: 10k): ")
            if not price:
                price = 10000
            bought_tickets.append((number, price))
            bank_money -= int(price)
            print(f"You have chosen the number {int(number):0{5}d} with a ticket price of {price} VND.")
            print("And today's lottery numbers are...")
            print("-"*30)
            winning_numbers = generate_numbers()
            print("-"*30)
            check_ticket(f"{int(number):0{5}d}", winning_numbers, price)
        elif choice == '4':
            print(f"Your bought tickets: {bought_tickets} - Total tickets: {len(bought_tickets)} - Total spent: {sum(int(ticket[1]) for ticket in bought_tickets)} VND")
        elif choice == '5':
            print("Thank you for using the XSKT MB Lottery System. Goodbye!")
            break
        else:
            print("Invalid choice. Please select a valid option.")

if __name__ == "__main__":
    main()