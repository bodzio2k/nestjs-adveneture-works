-- The below script is used to install the AdventureWorksLT sample for In-Memory OLTP in Azure SQL Database.
-- The sample requires a new Premium database, created based on the AdventureWorksLT sample.
--
-- Last updated: 2016-07-29
--
--
--  Copyright (C) Microsoft Corporation.  All rights reserved.
--
-- This source code is intended only as a supplement to Microsoft
-- Development Tools and/or on-line documentation.
--
-- THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF
-- ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
-- THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
-- PARTICULAR PURPOSE.


/*************************** Create Tables **********************************/

CREATE TABLE [SalesLT].[SalesOrderHeader](
	[SalesOrderID] int IDENTITY NOT NULL PRIMARY KEY NONCLUSTERED HASH WITH (BUCKET_COUNT=100000),
	[RevisionNumber] [tinyint] NOT NULL CONSTRAINT [IMDF_SalesOrderHeader_RevisionNumber]  DEFAULT ((0)),
	[OrderDate] [datetime2] NOT NULL ,
	[DueDate] [datetime2] NOT NULL,
	[ShipDate] [datetime2] NULL,
	[Status] [tinyint] NOT NULL CONSTRAINT [IMDF_SalesOrderHeader_Status]  DEFAULT ((1)),
	[OnlineOrderFlag] bit NOT NULL CONSTRAINT [IMDF_SalesOrderHeader_OnlineOrderFlag]  DEFAULT ((1)),
	[PurchaseOrderNumber] nvarchar(25) NULL,
	[AccountNumber] nvarchar(15) NULL,
	[CustomerID] [int] NOT NULL ,
	[BillToAddressID] [int] NOT NULL,
	[ShipToAddressID] [int] NOT NULL,
	[CreditCardApprovalCode] [varchar](15) NULL,
	[SubTotal] [money] NOT NULL CONSTRAINT [IMDF_SalesOrderHeader_SubTotal]  DEFAULT ((0.00)),
	[TaxAmt] [money] NOT NULL CONSTRAINT [IMDF_SalesOrderHeader_TaxAmt]  DEFAULT ((0.00)),
	[Freight] [money] NOT NULL CONSTRAINT [IMDF_SalesOrderHeader_Freight]  DEFAULT ((0.00)),
	[Comment] [nvarchar](128) NULL,
	[ModifiedDate] [datetime2] NOT NULL ,

	INDEX IX_CustomerID HASH (CustomerID) WITH (BUCKET_COUNT=10000)
) WITH (MEMORY_OPTIMIZED=ON)
GO

CREATE TABLE [SalesLT].[SalesOrderDetail](
	[SalesOrderID] int NOT NULL INDEX IX_SalesOrderID HASH WITH (BUCKET_COUNT=100000),
	[SalesOrderDetailID] bigint IDENTITY NOT NULL,
	[OrderQty] [smallint] NOT NULL,
	[ProductID] [int] NOT NULL INDEX IX_ProductID HASH WITH (BUCKET_COUNT=100000),
	[UnitPrice] [money] NOT NULL,
	[UnitPriceDiscount] [money] NOT NULL CONSTRAINT [IMDF_SalesOrderDetail_UnitPriceDiscount]  DEFAULT ((0.0)),
	[ModifiedDate] [datetime2] NOT NULL ,

	CONSTRAINT [imPK_SalesOrderDetail_SalesOrderID_SalesOrderDetailID] PRIMARY KEY NONCLUSTERED HASH
	(	[SalesOrderID],
		[SalesOrderDetailID]
	)WITH (BUCKET_COUNT=1000000)
) WITH (MEMORY_OPTIMIZED=ON)
GO

CREATE TABLE [SalesLT].[Product](
	[ProductID] [int] IDENTITY NOT NULL,
	[Name] nvarchar(50) NOT NULL INDEX IX_Name,
	[ProductNumber] [nvarchar](25) NOT NULL INDEX IX_ProductNumber,
	[Color] [nvarchar](15) NULL,
	[StandardCost] [money] NOT NULL,
	[ListPrice] [money] NOT NULL,
	[Size] [nvarchar](5) NULL,
	[Weight] [decimal](8, 2) NULL,
	[ProductModelID] [int] NULL,
	[SellStartDate] [datetime2] NOT NULL,
	[SellEndDate] [datetime2] NULL,
	[DiscontinuedDate] [datetime2] NULL,
	[ModifiedDate] [datetime2] NOT NULL CONSTRAINT [IMDF_Product_ModifiedDate]  DEFAULT (SYSDATETIME()),

	CONSTRAINT [IMPK_Product_ProductID] PRIMARY KEY NONCLUSTERED
	( [ProductID] )
)	WITH (MEMORY_OPTIMIZED=ON)
GO

CREATE TABLE Demo.DemoSalesOrderDetailSeed
(
	[OrderQty] [smallint] NOT NULL,
	[ProductID] [int] NOT NULL ,
	OrderID int NOT NULL INDEX IX_OrderID NONCLUSTERED,
	LocalID int IDENTITY NOT NULL PRIMARY KEY NONCLUSTERED
) WITH (MEMORY_OPTIMIZED=ON)
GO

CREATE TABLE Demo.DemoSalesOrderHeaderSeed
(
	DueDate [datetime2](7) NOT NULL,
	CustomerID [int] NOT NULL,
	BillToAddressID [int] NOT NULL,
	ShipToAddressID [int] NOT NULL,
	LocalID int IDENTITY NOT NULL PRIMARY KEY NONCLUSTERED
) WITH (MEMORY_OPTIMIZED=ON)
GO
