Want to know more about Multisignature?

Multisignature, often abbreviated as multisig, is a security feature used in blockchain and cryptocurrency systems to enhance the security and control over digital assets. It requires multiple private keys to authorize and execute transactions, as opposed to the traditional single-key systems where a single private key is sufficient to authorize transactions.

How Multisignature Works:

Key Generation: In a multisignature setup, multiple participants or parties generate their own unique public-private key pairs. Each participant holds their private key securely.
Creation of a Multisig Address: There are a few ways you can do that:
You can create a new address that will be the one used to do the transactions.
You can use an existing one.
Both ways, you need to add permissions to allow other participants to send transactions, and the remaining participants can sign if they agree with it. You can read more about on Account Permissions section.

This address is associated with a specific number of thresholds, often denoted as "m of n," where "m" represents the minimum number of signatures required to authorize a transaction, and "n" represents the total number of participants or addresses involved.

Transaction Authorization: When someone wants to send funds from the multisignature address, they create a transaction and specify that it requires the signatures of at least "m" out of the "n" participants to be valid. This ensures that no single individual can unilaterally move the funds. When the threshold is reached, any participant can broadcast the transaction to klever blockchain.

Signature Collection: Each participant in the multisignature setup reviews the transaction and, if they agree with it, signs it with their private key. These signatures are then combined and attached to the transaction.

Transaction Execution: Once the required number of participants have signed the transaction, it becomes valid and any participant can broadcast, and the klever blockchain network processes it, transferring the funds as specified.

How to Create a Multisignature Transaction:

After you've created the address that will be used for transactions and requires multiple signatures, you need to configure the permissions on that address. You can read more about on Account Permissions section.

Once on Klever Explorer, enter the "create transaction" page through the navbar or directly access https://kleverscan.org/create-transaction.
Create Transaction through navbar

Once you've added all the necessary permissions and participants/addresses needed, you can create the transaction. On the create transactions page, you can select any contract and fill it as you wish. Then, in 'Advanced Options,' change the option Does your account need multiple signatures? to Yes.
Enable Multisign

If you're in the account that is the one used for multisigning, you don't need to change the Sender; only change the permission to be the one that other participants must sign too.
Change Sender

But if you're in another address, then you need to:
Change the Sender by selecting the option Do you want to use the current account as the sender? to No.
Fill the Sender Account Address'with the address of the multisignature.
Change to the correct permission for that transaction.
Change sender and permission

You can sign the transaction now or not, changing the option Do you want to sign the transaction now? as you wish.

When all fields are filled correctly, click Create Transaction, and the transaction will be added to our API for the other participants to sign. Keep in mind that the transaction is not on the klever blockchain network yet; it must reach the threshold and then be broadcasted.

Checking and Signing the Transaction:

Once the transaction is created, you can check it by accessing Klever Explorer Multisign page or through the navbar. Here, you can view information about the transaction, including the number of signatures obtained and the number still required to reach the threshold, among other details. Furthermore, if you agree with the transaction and have not yet signed it, you have the option to do so.

Access Multisign Page



Broadcasting the Transaction:

After the threshold is reached, any participants can broadcast it to the klever blockchain network clicking on Broadcast Transaction.

Additional Option: Importing and Signing with JSON:

You can also download the JSON file of the transaction using the Download JSON file, send it to other participants, and they can sign the transaction using Klever Explorer through the Import Signed JSON file.